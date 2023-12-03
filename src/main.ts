import { Color } from "./lib";

async function main() {
    const color = new Color();
    document.querySelector("button")!.addEventListener("click", async () => {
        const res = await color.getColor();
        console.log(res);
        document.body.style.backgroundColor = res;
    });
}

main();
