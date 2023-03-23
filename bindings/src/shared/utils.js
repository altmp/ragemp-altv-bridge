export const vdist2 = (v1, v2, useZ = true) => {
    if (!v1 || !v2) {
        return -1;
    }

    let dx = v1.x - v2.x;
    let dy = v1.y - v2.y;
    let dz = useZ ? v1.z - v2.z : 0;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}