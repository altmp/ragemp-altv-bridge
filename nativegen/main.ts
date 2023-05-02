import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as fs from 'fs';
import type { Node, Identifier, FunctionExpression, MemberExpression, Literal } from 'estree';
import fetch from 'node-fetch';
import { walk } from 'estree-walker';

const source = fs.readFileSync('../dump/client_internals.js', 'utf8');

function sanitizeNativeArgument(value, type) {
    if (type === "string") return `typeof (${value}) == "string" ? ${value} : null`;
    if (type === "boolean") return `Boolean(${value})`;
    return `typeof (${value}) == "number" ? ${value} : 0`;
}

interface AltNative {
    name: string;
    altName: string;
    hashes: Record<string, string>;
    params: { type: string, name: string, ref: boolean }[];
    results: string;
}

interface ParsedNative {
    altNative: AltNative;
    functionArguments: string[];
    callArguments: string[];
    resObjectInitialValue?: string; // Initial value for result object, {} if not set
    resObject?: Record<string, string>; // Keys to set on resObject
    return?: string; // return value expression;
    hash: string;
}

interface NativeInvoker {
    name: string;
    alignment: number;
    vector: boolean;
}

// name to hash (without 0x)
let natives: Record<string, string> = {};
const rawNatives = JSON.parse(fs.readFileSync('./assets/natives.json', 'utf8'));
for (const namespace of Object.values(rawNatives)) {
    for (let [hash, native] of Object.entries(namespace as any)) {
        hash = hash.substring(2); // remove 0x
        natives[native.name] = hash;
        if (native.name.startsWith('_')) natives[native.name.substring(1)] = hash;
        else natives[`_${native.name}`] = hash;
        for (const name of (native.old_names || [])) {
            natives[name] = hash;
            if (name.startsWith('_')) natives[name.substring(1)] = hash;
            else natives[`_${name}`] = hash;
        }
    }
}
const nativesEnums = fs.readFileSync('./assets/natives.ts', 'utf8');
const reg = /(\w+) = '0x([\dA-F]+)'/g;
let result;
while((result = reg.exec(nativesEnums)) != null) {
    natives[result[1]] = result[2];
}

// hash (without 0x) to native object
const rawAltNatives = await (await fetch('https://natives.altv.mp/natives')).json() as Record<string, Record<string, AltNative>>;
let altNatives: Record<string, AltNative> = {};
for (const namespace of Object.values(rawAltNatives)) {
    for (const [hash, native] of Object.entries(namespace as Record<string, AltNative>)) {
        altNatives[hash.substring(2)] = native;
        if (!native.hashes) continue;
        for (let verHash of Object.values(native.hashes as Record<string, string>)) {
            verHash = verHash.substring(2);
            if (verHash in altNatives) continue;
            altNatives[hash] = native;
        }
    }
}

function serializeStaticMemberExpr(expr: Node): string | null {
    if (expr.type === 'Identifier') return expr.name;
    if (expr.type !== 'MemberExpression') return null;
    let first = serializeStaticMemberExpr(expr.object);
    if (first == null) return null;
    let second = serializeStaticMemberExpr(expr.property);
    if (second == null) return null;
    return first + '.' + second;
}

// default 2
const invokerAlignments = {
    '__invokeFastReassVecRef': 6,
    '__invokeFastReassVecRefVoid': 6,
};
const vectorInvokers = [
    '__invokeFastReassVec3',
    '__invokeFastReassVecRefVec3',
    '__invokeFastReassStringRefVec3',
    '__invokeFastVec3'
]

const argumentBufferTypes = [
    'Float32Array',
    'Int32Array',
    'Uint32Array'
];

let nativeInvokers: Record<string, NativeInvoker> = {};
let argumentBuffers = [];
let stringEncoder = '';
const prototypes = {};
let nativeWrappers: Record<string, ParsedNative> = {};
let wrappersFound = 0;
let foundNativeNames = [];

function isNodeInvoker(node: Node): boolean {
    if (node.type != 'CallExpression') return false;
    if (node.callee.type != 'Identifier') return false;
    return node.callee.name in nativeInvokers;
}

function registerNativeFunction(id: Identifier, fn: FunctionExpression, invoker: NativeInvoker) {
    const name = id.name;
    let hash;
    if (name.startsWith('_0x')) {
        hash = name.substring(3);
    } else {
        hash = natives[name] || natives[`_${name}`];
        if (!hash && name.endsWith(`_RAW`)) hash = natives[name.substring(0, id.name.length - 4)];
    }

    if (!hash) throw Error(id.name);
    wrappersFound++;

    if (!altNatives[hash]) {
        console.warn(`! Native not found in alt:V DB:`, id.name, hash);
        return;
    }

    const paramsCount = altNatives[hash].params.length;
    const parsed: ParsedNative = {
        altNative: altNatives[hash],
        functionArguments: fn.params.map(e => e.type === 'Identifier' ? e.name : ''),
        callArguments: Array(paramsCount),
        resObject: {},
        resObjectInitialValue: invoker.vector ? 'new mp.Vector3(0, 0, 0)' : '{}',
        hash: '0x' + hash
    };

    let resObjectIdentifier = '';
    let scriptParamsCount = -1;

    let refMapping = Array(paramsCount).fill(0);
    let refI = 1;
    for (let i = 0; i < altNatives[hash].params.length; i++){
        const arg = altNatives[hash].params[i];
        if (arg.ref && arg.type != 'Any') refMapping[i] = refI++;
    }

    for (const el of fn.body.body) {
        // If its an argument statement ($4[6] = someArg)
        if (el.type === 'ExpressionStatement'
                && el.expression.type === 'AssignmentExpression'
                && el.expression.operator === '='
                && el.expression.left.type === 'MemberExpression'
                && el.expression.left.object.type === 'Identifier'
                && el.expression.left.property.type === 'Literal'
                && argumentBuffers.includes(el.expression.left.object.name)) {

            const index = +el.expression.left.property.raw;
            if (index == 1 && el.expression.right.type === 'Literal') scriptParamsCount = +el.expression.right.raw;
            if (index < 2) continue;

            const argId = Math.floor((index - 2) / invoker.alignment);
            if (argId < 0 || argId >= scriptParamsCount) continue;

            parsed.callArguments[argId] = escodegen.generate(el.expression.right);
        }

        // If its a string argument statement ($n(6, someArg, $1d))
        if (el.type === 'ExpressionStatement'
            && el.expression.type === 'CallExpression'
            && el.expression.callee.type === 'Identifier'
            && el.expression.callee.name === stringEncoder
            && el.expression.arguments[0].type === 'Literal'
            && el.expression.arguments[1].type === 'Identifier') {

            const index = +el.expression.arguments[0].raw;
            const argId = Math.floor((index - 2) / invoker.alignment);
            if (argId < 0 || argId >= scriptParamsCount) continue;

            if (parsed.altNative.params[argId].type == "string") {
                parsed.callArguments[argId] = el.expression.arguments[1].name;
            } else {
                parsed.callArguments[argId] = sanitizeNativeArgument(el.expression.arguments[1].name, parsed.altNative.params[argId].type);
            }
        }

        // Find all the return object members
        if (el.type === 'ExpressionStatement'
            && el.expression.type === 'AssignmentExpression'
            && el.expression.operator === '='
            && el.expression.left.type === 'MemberExpression'
            && (
                (el.expression.right.type === 'MemberExpression'
                && el.expression.right.object.type === 'Identifier'
                && argumentBuffers.includes(el.expression.right.object.name)
                && el.expression.right.property.type === 'Literal') ||
                (el.expression.right.type === 'BinaryExpression'
                && el.expression.right.left.type === 'MemberExpression'
                && el.expression.right.left.object.type === 'Identifier'
                && argumentBuffers.includes(el.expression.right.left.object.name)
                && el.expression.right.left.property.type === 'Literal')
            )) {

            let resObjId = el.expression.left.object;
            while (resObjId.type == 'MemberExpression') {
                resObjId = resObjId.object;
            }
            if (resObjId.type === 'Identifier') resObjectIdentifier = resObjId.name;

            const prop = (el.expression.right.type === 'MemberExpression' ? el.expression.right : (el.expression.right.left as MemberExpression)).property as Literal;
            const argId = Math.floor((+prop.raw - 2) / invoker.alignment);
            const refId = refMapping[argId];

            const expr = walk(el.expression.right, {
                enter(node) {
                    if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && argumentBuffers.includes(node.object.name) && node.property.type === 'Literal') {
                        this.replace({ type: 'MemberExpression', computed: true, optional: false, object: { type: 'Identifier', name: '$res' }, property: { type: 'Literal', raw: String(refId), value: refId }})
                    }
                    if (node.type === 'BinaryExpression' && node.operator == '===') {
                        this.replace({ ...node, operator: '==' });
                    }
                }
            });

            const key = escodegen.generate(el.expression.left).split('.').slice(1).join('.');
            if (key.endsWith('.x')) {
                parsed.resObject[key.substring(0, key.length - 2)] = `new mp.Vector3($res[${refId}])`
            } else if (key.endsWith('.y') || key.endsWith('.z')) {
            } else if ((key === 'x' || key === 'y' || key === 'z') && invoker.vector) {
                parsed.resObject[key] = `$res[0].${key}`;
            } else {
                parsed.resObject[key] = escodegen.generate(expr);
            }
        }
        
        // Parse and adapt return expression
        if (el.type === 'ReturnStatement') {
            const expr = walk(el.argument, {
                enter(node) {
                    if (node.type === 'Identifier' && node.name === resObjectIdentifier) {
                        return this.replace({ type: 'Identifier', name: '$resObj' });
                    }
                    if ((node.type === 'Identifier' && node.name === 'resultString') || isNodeInvoker(node)) {
                        return this.replace({ type: 'MemberExpression', object: { type: 'Identifier', name: '$res' }, property: { type: 'Literal', value: 0 }, computed: true, optional: false });
                    }
                    if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && argumentBuffers.includes(node.object.name) && node.property.type === 'Literal') {
                        const argId = Math.floor((+node.property.raw - 2) / invoker.alignment);
                        const refId = refMapping[argId] ?? 0;
                        this.replace({ type: 'MemberExpression', object: { type: 'Identifier', name: '$res' }, property: { type: 'Literal', value: refId }, computed: true, optional: false })
                    }
                }
            });
            parsed.return = escodegen.generate(expr);
        }
    }

    // Fill missing arguments with default values
    for (let i = 0; i < paramsCount; i++) {
        if (parsed.callArguments[i] != null) continue;
        const param = altNatives[hash].params[i];
        if (param.type === 'boolean') parsed.callArguments[i] = 'false';
        else if (param.type === 'string') parsed.callArguments[i] = 'null';
        else if (param.type === 'Vector3') parsed.callArguments[i] = 'undefined';
        else parsed.callArguments[i] = '0';
    }

    nativeWrappers[cleanWrapperName(id.name)] = parsed;
}

function cleanWrapperName(wrapperName) {
    if (wrapperName.endsWith('_CHECK')) return wrapperName.substring(0, wrapperName.length - 6);
    if (wrapperName.endsWith('_METHOD')) return wrapperName.substring(0, wrapperName.length - 7);
    return wrapperName;
}

function generateNativeCaller(native: ParsedNative, entity = false) {
    const outArgs = entity ? [`this.handle`, ...native.callArguments.slice(1)] : native.callArguments;
    const inArgs = native.functionArguments.slice(entity ? 1 : 0);

    // TODO: Do not create $res when it is not used
    let res = `function (${inArgs.join(', ')}) {\n`
    for (let param of native.altNative.params) {
        if (param.type == "string") res += `    if (typeof ${param.name} != "string") ${param.name} = null;\n`;
    }
    res += `    let $res = natives.${native.altNative.altName}(${outArgs.join(', ')});\n`;
    // TODO: Avoid creating an array
    if (native.return) res += `    if (!Array.isArray($res)) $res = [$res];\n`;
    if (native.return && native.resObject && Object.values(native.resObject).length > 0) {
        res += `    let $resObj = ${native.resObjectInitialValue ?? '{}'};\n`;
        for (const [key, value] of Object.entries(native.resObject)) {
            res += `    $resObj.${key} = ${value};\n`;
        }
    }
    if (native.return) res += `    return ${native.return};\n`;
    res += `}`;
    return res;
}

let outputCode = `
import * as natives from 'natives';
import * as alt from 'alt-client';
import mp from '../shared/mp.js';
mp.game2 ??= {};
const hashes = {};

`;
const prototypeCalls = {};

let tempVars = {};

console.log('Starting to parse');
esprima.parseScript(source, {}, (node) => {
    // Find string encoder function (a function with 3 args, first expression is an if comparing 2nd arg with null)
    if (stringEncoder === ''
        && node.type === 'FunctionDeclaration'
        && node.id.type === 'Identifier'
        && node.params.length === 3
        && node.params[1].type === 'Identifier' // str param
        && node.body.type === 'BlockStatement'
        && node.body.body[0].type === 'IfStatement'
        && node.body.body[0].test.type === 'BinaryExpression'
        && node.body.body[0].test.operator === '!='
        && node.body.body[0].test.left.type === 'Identifier'
        && node.body.body[0].test.left.name === node.params[1].name
        && node.body.body[0].test.right.type === 'Literal'
        && node.body.body[0].test.right.raw === 'null') {
        console.log(`Found a string encoder function: ${node.id.name}`);
        stringEncoder = node.id.name;
    }

    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
        // Find invoker functions
        if (node.init?.type === 'MemberExpression'
            && node.init.property.type === 'Identifier'
            && node.init.property.name.startsWith('__invoke')
            && serializeStaticMemberExpr(node.init.object) === 'mp.game') {
            nativeInvokers[node.id.name] = { name: node.init.property.name, alignment: invokerAlignments[node.init.property.name] ?? 2, vector: vectorInvokers.includes(node.init.property.name) };
            console.log(`Found a native invoker: ${node.id.name} (${node.init.property.name})`);
        }

        // Find argument buffers
        if (node.init?.type === 'NewExpression'
            && node.init.callee.type === 'Identifier'
            && argumentBufferTypes.includes(node.init.callee.name)) {
            console.log(`Found an argument buffer: ${node.id.name} (${node.init.callee.name})`);
            argumentBuffers.push(node.id.name);
        }

        // Find prototype variables
        if (node.init?.type === 'MemberExpression'
            && node.init.property.type === 'Identifier'
            && node.init.property.name === 'prototype'
            && serializeStaticMemberExpr(node.init.object).startsWith('mp.')) {
            const prototype = serializeStaticMemberExpr(node.init.object);
            prototypes[node.id.name] = prototype;
            console.log(`Found a prototype: ${node.id.name} (${prototype})`);
            outputCode += `${prototype} ??= {};\n`;
            outputCode += `${prototype}.prototype ??= {};\n`;
        }

        // Find functions natives (a function that calls an invoker)
        if (node.init?.type === 'FunctionExpression' && node.init.body.type === 'BlockStatement') {
            outer: for (const element of node.init.body.body) {
                if (element.type === 'ExpressionStatement' && isNodeInvoker(element.expression)) {
                    registerNativeFunction(node.id, node.init, nativeInvokers[(element.expression as any).callee.name]);
                    break;
                }

                if (element.type === 'ReturnStatement' && isNodeInvoker(element.argument)) {
                    registerNativeFunction(node.id, node.init, nativeInvokers[(element.argument as any).callee.name]);
                    break;
                }

                if (element.type === 'VariableDeclaration') {
                    for (const declaration of element.declarations) {
                        if (!declaration.init) continue;
                        if (isNodeInvoker(declaration.init)) {
                            registerNativeFunction(node.id, node.init, nativeInvokers[(declaration.init as any).callee.name]);
                            break outer;
                        }
                    }
                }
            }
        }
    }

    // Find mp namespace fill
    if (node.type === 'ExpressionStatement'
        && node.expression.type === 'AssignmentExpression'
        && node.expression.operator === '='
        && node.expression.right.type === 'Identifier'
        && cleanWrapperName(node.expression.right.name) in nativeWrappers) {
        const name = cleanWrapperName(node.expression.right.name);
        const expr = node.expression;
        if (expr.left.type === 'MemberExpression' && expr.left.object.type === 'Identifier' && expr.left.object.name in prototypes && expr.left.property.type === 'Identifier') {
            const prototype = prototypes[expr.left.object.name];
            prototypeCalls[`${prototype}.prototype.${expr.left.property.name}`] = `${generateNativeCaller(nativeWrappers[name], true)};\n`;
            if (prototype == "mp.Player") foundNativeNames.push(expr.left.property.name);
        } else if (expr.left.type === 'MemberExpression' && expr.left.object.type === 'Identifier' && expr.left.property.type === 'Identifier') {
            if (!tempVars[expr.left.object.name]) tempVars[expr.left.object.name] = [];
            tempVars[expr.left.object.name].push(`.${expr.left.property.name} ??= ${generateNativeCaller(nativeWrappers[name])};\n`);
        }
    }

    // Flush buffered mp namespace content to the actual mp
    if (node.type === 'ExpressionStatement'
        && node.expression.type === 'AssignmentExpression'
        && node.expression.operator === '='
        && node.expression.right.type === 'Identifier'
        && node.expression.left.type === 'MemberExpression'
        && node.expression.right.name in tempVars) {
        const name = serializeStaticMemberExpr(node.expression.left);
        const chunks = name.split('.');
        for (let i = 2; i < chunks.length; i++) {
            const currName = chunks.slice(0, i + 1).join('.');
            outputCode += `${currName} ??= {};\n`;
        }
        const buf = tempVars[node.expression.right.name];
        outputCode += buf.map(e => name + e).join('');
        console.log(`Flushed ${node.expression.right.name} with ${buf.length} natives to ${name}`);
        delete tempVars[node.expression.right.name];
    }
});

outputCode += Object.entries(prototypeCalls).map(([k, v]) => `${k} ??= ${v}`).join('\n');

function generateInvokeFunction(native: AltNative) {
    let output = `function(${native.params.map((p, i) => `p${i}`).join(', ')}) {\n`;
    const args = [];
    const result = [];
    let refId = 1;
    let argId = 0;
    for (const param of native.params) {
        const name = `p${argId++}`;
        if (!param.ref || param.type === 'Any') {
            args.push(sanitizeNativeArgument(name, param.type));
            continue;
        }
        const currRef = refId++;
        const resVar = `$res[${currRef}]`;
        if (param.type === 'Vector3') {
            output += `    if (typeof ${name} != 'object') throw new Error('Argument ${param.name} should be a Vector3 or an array');\n`;
            args.push(`Array.isArray(${name}[0]) ? new alt.Vector3(${name}[0][0], ${name}[0][1], ${name}[0][2]) : new alt.Vector3(${name}[0].x, ${name}[0].y, ${name}[0].z)`);
            result.push(`if (Array.isArray(${name}[0])) { ${name}[0][0] = ${resVar}.x; ${name}[0][1] = ${resVar}.y; ${name}[0][2] = ${resVar}.z }`);
                result.push(`else { ${name}[0].x = ${resVar}.x; ${name}[0].y = ${resVar}.y; ${name}[0].z = ${resVar}.z; }`);
        } else {
            args.push(sanitizeNativeArgument(`${name}[0]`, param.type));
            result.push(`${name}[0] = ${resVar};`);
        }
    }

    const isVector = !!native.results.match(/^\[?Vector3/);
    output += `    const $res = natives.${native.altName}(${args.join(', ')});\n`
    if (refId === 1) {
        if (isVector) output += `    return new mp.Vector3($res);\n}`
        else output += `    return $res;\n}`
        return output;
    }
    output += `    if (!Array.isArray($res)) return $res instanceof alt.Vector3 ? new mp.Vector3($res) : $res;\n`;
    output += result.map(e => `    ` + e).join(`\n`) + `\n`;
    if (output) {
        if (isVector) output += `    return new mp.Vector3($res[0]);\n}`;
        else output += `    return $res[0];\n}`;
    }
    return output;
}

for (const namespace of Object.values(rawAltNatives)) {
    for (const [key, value] of Object.entries(namespace)) {
        outputCode += `hashes['${key}'] = ${generateInvokeFunction(value)}\n`;
    }
}

outputCode += `
mp.game2.invoke = mp.game2.invokeFloat = mp.game2.invokeString = mp.game2.invokeVector3 = function (hash, ...args) {
    if (typeof hash === 'number') hash = '0x' + hash.toString(16);
    else if (typeof hash != 'string') hash = String(hash);
    if (hashes[hash]) return hashes[hash](...args);
    throw new Error(\`Native \${hash} not found\`);
}

mp.game = mp.game2;
`

fs.writeFileSync('../bindings/src/client/natives.js', outputCode);

console.log(JSON.stringify(foundNativeNames));