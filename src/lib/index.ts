import domtoimage from "dom-to-image";

type Rect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

function fllowMe(x: number, y: number, node: HTMLElement) {
    node.style.left = x - node.clientWidth / 2 + "px";
    node.style.top = y - node.clientHeight / 2 + "px";
}

class Color {
    node: HTMLElement;
    width: number;
    height: number;
    throds: number = 4;
    r = 255;
    g = 255;
    b = 255;
    a = 255;
    constructor() {
        this.node = document.body;
        this.width = this.node.scrollWidth;
        this.height = this.node.scrollHeight;
    }

    async getColor(): Promise<string> {
        const imagedata = await this.getImage();
        const canvas = document.createElement("canvas");
        const length = 11;
        const pxLength = 11;
        const r = length >> 1;
        const r2 = r << 1;
        canvas.width = length * pxLength;
        canvas.height = length * pxLength;

        canvas.style.borderRadius = "50%";
        canvas.style.position = "absolute";
        canvas.style.border = "1px solid #000000";
        this.node.append(canvas);
        const ctx = canvas.getContext("2d");
        const mouseMoveHandler = (e: MouseEvent) => {
            fllowMe(e.pageX, e.pageY, canvas);
            e.stopPropagation();
            const x = e.pageX;
            const y = e.pageY;

            const rect = this.getRect(x, y, r + 1);
            const rectData = this.getDataByRect(imagedata, rect, length * length);
            // const rectImage = new ImageData(rectData, r2, r2);
            // ctx2?.putImageData(rectImage, 0, 0);
            // const ddd = ctx2?.getImageData(0, 0, r2, r2)!;
            // console.log(rectData);

            // return;
            ctx?.clearRect(length * pxLength, length * pxLength, 0, 0);
            for (let y = 0; y < length; ++y) {
                for (let x = 0; x < length; ++x) {
                    const index = length * this.throds * y + this.throds * x;
                    const r = rectData[index];
                    const g = rectData[index + 1];
                    const b = rectData[index + 2];
                    const a = rectData[index + 3];
                    this.r = r;
                    this.g = g;
                    this.b = b;
                    this.a = a;

                    ctx!.fillStyle = `rgb(${r},${g},${b})`;
                    // console.log(`rgba(${r},${g},${b},${a})`);
                    ctx?.fillRect(x * pxLength, y * pxLength, pxLength, pxLength);
                }
            }
            const center = length >> 1;
            ctx!.strokeStyle = "#000";
            ctx?.strokeRect(center * pxLength, center * pxLength, pxLength, pxLength);
        };

        this.node.addEventListener("mousemove", mouseMoveHandler);

        return new Promise((res) => {
            const clickHandler = (e: MouseEvent) => {
                const r = this.r.toString(16).padStart(2, "0");
                const g = this.g.toString(16).padStart(2, "0");
                const b = this.b.toString(16).padStart(2, "0");
                const a = this.a.toString(16).padStart(2, "0");
                const rgba = r + b + g + a;
                res("#" + rgba.toUpperCase());
                this.node.removeEventListener("click", clickHandler);
                this.node.removeEventListener("mousemove", mouseMoveHandler);
                canvas.remove();
            };

            this.node.addEventListener("click", clickHandler, { capture: true });
        });
    }

    getDataByRect(data: Uint8ClampedArray, rect: Rect, size: number): Uint8ClampedArray {
        const { left, right, top, bottom } = rect;

        const arr = new Uint8ClampedArray(size * this.throds);
        arr.fill(255);
        let ii = 0;
        for (let y = top; y < bottom; ++y) {
            for (let x = left; x < right; ++x) {
                const index = this.width * this.throds * y + this.throds * x;
                for (let i = 0; i < this.throds; ++i) {
                    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
                        arr[ii++] = 255;
                        continue;
                    }
                    arr[ii++] = data[index + i];
                }
            }
        }
        for (let i = ii + 1; i < size * this.throds; ++i) {
            arr[i] = 255;
        }

        return arr;
    }

    async getImage() {
        const node = document.body;
        const image = domtoimage.toPixelData(node);
        return image;
    }

    getRect(originX: number, originY: number, length: number) {
        const left = originX - length;
        const right = originX + length;
        const top = originY - length;
        const bottom = originY + length;
        return {
            left,
            right,
            top,
            bottom,
        };
    }
}

export { Color };
