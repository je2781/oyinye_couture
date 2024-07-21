import { Base64ImagesObj, DressColorsObj, DressSizesJsxObj, DressSizesObj } from "@/interfaces";

export const sizes = [8, 10, 12, 14, 16, 18];

// export let sizesJsxObj: DressSizesJsxObj  = {};
// export let sizesObj: DressSizesObj  = {};
// export let colorsObj: DressColorsObj  = {};
// export let frontBase64ImagesObj: Base64ImagesObj = {};

// export function sortAndStoreDressColors(product: any){
//     //sorting extracted sizes for all dress colors and storing them for later use
//     for(let color of product.colors){
//         color.sizes = color.sizes.filter((size: any) => size.stock > 0);
//         color.sizes.sort((a: any, b: any) => a.number - b.number);

//         for(let size of color.sizes){
//             colorsObj[color.type]
//             ? colorsObj[color.type].push(size.number)
//             : colorsObj[color.type] = [size.number];
//         }
//     }
// }


// export function handleColorChange(e: React.MouseEvent, colorsObj: DressColorsObj, selectedColor: string, setSelectedSize: React.Dispatch<React.SetStateAction<string>>, setSelectedColor: React.Dispatch<React.SetStateAction<string>>, sizes: number[], colors: any){
//     let activeColorEl = e.currentTarget as HTMLSpanElement;

//     let colorNodeList = activeColorEl.parentNode!.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
//     let otherColorEls = Array.from(colorNodeList);
//     let sizeNodeList = activeColorEl.closest('p')!.parentNode!.querySelectorAll('#size-list > div > span') as NodeListOf<HTMLSpanElement>;
//     let sizeEls = Array.from(sizeNodeList);

//     otherColorEls.forEach(el => {
//         if(el.classList.contains('bg-black') || el.style.getPropertyValue('background-color') === 'black'){
//             el.style.setProperty('background-color', 'transparent');
//             el.style.setProperty('color', 'rgb(75, 85, 99 )');
//             el.classList.add('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
//             el.classList.remove('bg-black');
//         }
//     });

//     activeColorEl.style.setProperty('background-color', 'black');
//     activeColorEl.style.setProperty('color', 'white');
//     activeColorEl.classList.remove('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
//     activeColorEl.classList.add('bg-black');

//     /**updating active dress color ***/
//     for(let color of colors){
//         for (let i = 0; i < sizes.length; i++) {
//             if (color.type === activeColorEl.innerText && !color.sizes.some((size: any) => size.number === colorsObj[selectedColor][i]) && colorsObj[selectedColor][i]) {
//                 // Setting properties of size element not contained in active dress color to 'not in stock'
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === colorsObj[selectedColor][i].toString())].style.setProperty('background-color', 'transparent');
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === colorsObj[selectedColor][i].toString())].style.setProperty('color', 'rgb(156, 163, 175)');
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === colorsObj[selectedColor][i].toString())].classList.add('border', 'border-gray-200');
                
//                 // Setting properties of first size element contained in active dress color to 'current selection'
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].style.setProperty('background-color', 'black');
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].style.setProperty('color', 'white');
//                 sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].classList.remove('hover:ring-1', 'ring-gray-600');
//                 // Setting properties of other size elements contained in active dress color to 'available for selection'
//                 if (color.sizes.slice(1).length > 0) {
//                     for (let size of color.sizes.slice(1)) {
//                         sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === size.number.toString())].style.setProperty('color', 'rgb(75, 85, 99)');
//                     }
//                 }
        
//                 setSelectedSize(color.sizes[0].number.toString());
//             }
//         }
        
//     }
//     setSelectedColor(activeColorEl.innerText);

    
// }

// export function handleSizeChange(e: React.MouseEvent, setSelectedSize: React.Dispatch<React.SetStateAction<string>>){
//     let activeSizeEl = e.currentTarget as HTMLSpanElement;

//     let nodeList = activeSizeEl.parentNode!.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
//     let otherSizeEls = Array.from(nodeList);

//     otherSizeEls.forEach(el => {
//         if(el.classList.contains('bg-black') || el.style.getPropertyValue('background-color') === 'black'){
//             el.style.setProperty('background-color', 'transparent');
//             el.style.setProperty('color', 'rgb(75, 85, 99 )');
//             el.classList.add('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
//             el.classList.remove('bg-black');
//         }
//     });

//     activeSizeEl.style.setProperty('background-color', 'black');
//     activeSizeEl.style.setProperty('color', 'white');
//     activeSizeEl.classList.remove('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
//     activeSizeEl.classList.add('bg-black');
//     //updating active dress size
//     setSelectedSize(activeSizeEl.innerText.split(' ')[1]);
// }
