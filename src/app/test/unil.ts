interface Place {
    x: number;
    y: number;
}
interface Windowsize{
    width:number
    height:number
}

let moveX, moveY = 0;

export function moveToRight(old: Place, now: Place) {
    return function () {
        old.x > now.x ? (moveX = -1) : (moveX = 1);
        old.x > now.y ? (moveY = -1) : (moveY = 1);
        if (Math.abs(old.x - now.x) > 10) old.x += moveX;
        if (Math.abs(old.y - now.y) > 10) old.y += moveY;
    };
}
export function changeUnit(  ){

}