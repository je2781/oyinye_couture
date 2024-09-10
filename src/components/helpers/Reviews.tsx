'use client';

import Stars from '../../../public/shooting-stars.svg';
import Image from 'next/image';
import { ReviewsModal } from '../ui/Modal';
import React from 'react';
import { base64ToFile, generateBase64FromMedia } from '@/helpers/getHelpers';
import DocViewerComponent from './DocViewer';
import toast from 'react-hot-toast';
import axios from 'axios';

const Reviews = ({productReviews, product}: any) => {
    let averageRating = 0;
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [mediaBase64, setMediaBase64] = React.useState('');
    const [review, setReview] = React.useState('');
    const [headline, setHeadline] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState('');
    const [loader, setLoader] = React.useState(false);
    const [isActive, setIsActive] = React.useState({
        star1: false,
        star2: false,
        star3: false,
        star4: false,
        star5: false
    });

    const [selectedRating, setSelectedRating] = React.useState<any>('all');
    const [reviews, setReviews] = React.useState<any>(productReviews);

    const handleSelect = (e: React.MouseEvent, rating: any) => {
        const selected = e.currentTarget;
        const allRatings = selected.parentNode?.querySelectorAll('li');

        if(allRatings){
            allRatings.forEach(li => {
                let checkmark = li.querySelector('.check');
                if(!checkmark?.classList.contains('hidden')){
                    checkmark?.classList.add('hidden');
                    li.classList.remove('bg-yellow-400/10');
                }
            });
        }

        selected.classList.add("bg-yellow-400/10");
        selected.querySelector('.check')?.classList.remove('hidden');
        selected.querySelector('.check')?.classList.add('bg-yellow-400/10');
        setSelectedRating(rating);
    };

    
    if(reviews.length > 0){
        averageRating = Math.floor(reviews.map((review: any) => review.rating).reduce((prev: number, current: number) => prev + current, 0)/reviews.length)
    }

    const hideModalHandler = () => {
        const previewContainer = document.getElementById('preview') as HTMLDivElement;
        const textarea = document.getElementById('review') as HTMLDivElement;
        
        if(previewContainer && textarea){
            previewContainer.classList.add('hidden');
            textarea.classList.remove('hidden');
        }
        setIsModalOpen(false);
    }

    const activeMessage = (currentActive: number) => {
        let message = '';
        switch (currentActive) {
            case 1:
                message = 'Very poor';
                break;
            case 2:
                message = 'Poor';
                break;
            case 3:
                message = 'Average';
                break;
            case 4:
                message = 'Good';
                break;
        
            default:
                message = 'Great';
                break;
        }

        return message;
    }

    const getRating = (message: string) => {
        let rating = 0;
        switch (message) {
            case 'Very poor':
                rating  = 1;
                break;
            case 'Poor':
                rating = 2;
                break;
            case 'Average':
                rating = 3;
                break;
            case 'Good':
                rating = 4;
                break;
        
            default:
                rating = 5;
                break;
        }

        return message;
    }

    function handleMouseLeave(){
        let text = document.querySelector('#statement') as HTMLParagraphElement;
        let stars = document.querySelectorAll('[id^="star"]');

        let noOfActive = Object.values(isActive).filter(val => val === true).length;
        if(noOfActive >= 1){
            text.innerText = activeMessage(noOfActive);
        }else{
            text.innerText = '';
        }
        Object.values(isActive).forEach((val, i) => {
            if(val === true){
                stars[i].classList.remove('fa-regular');
                stars[i].classList.add('fa-solid');
            }else{
                stars[i].classList.add('fa-regular');
                stars[i].classList.remove('fa-solid');
            }
        });
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>){
        const file = e.target.files![0];
        const previewContainer = document.getElementById('preview') as HTMLDivElement;
        const textarea = document.getElementById('review') as HTMLDivElement;
        
        if(previewContainer && textarea){
            previewContainer.classList.remove('hidden');
            // Clear previous previews
            previewContainer.innerHTML = '';

            textarea.classList.add('hidden');

            if (file) {
               
               let base64String = await generateBase64FromMedia(file);
    
               setMediaBase64(base64String as string);
    
               const fileType = file.type;
               
               if (fileType === 'text/plain') {
                    // For .txt files, display as plain text
                    const textContent = await file.text(); // Read as plain text
                    const pre = document.createElement('pre');
                    pre.textContent = textContent;
                    previewContainer.appendChild(pre);
                }  else if (file.type === 'application/pdf') { // PDF file preview
                   const pdfIframe = document.createElement('iframe');
                   pdfIframe.src = URL.createObjectURL(file);
                   pdfIframe.style.width = '100%';
                   pdfIframe.style.height = '500px'; // Adjust height as needed
                   previewContainer.appendChild(pdfIframe);
                } else if (fileType.startsWith('audio/')) { // Audio file preview
                   const audio = document.createElement('audio');
                   audio.controls = true;
                   audio.style.width = '100%';
                   audio.src = URL.createObjectURL(file);
                   previewContainer.appendChild(audio);
               } else if (fileType.startsWith('video/')) { // Video file preview
                   const video = document.createElement('video');
                   video.controls = true;
                   video.style.width = '100%';
                   video.src = URL.createObjectURL(file);
                   previewContainer.appendChild(video);
               } else {
                    previewContainer.classList.add('hidden');
                    textarea.classList.remove('hidden');
                    alert('Unsupported file type!');
               }
           }
        }
         
    }

    React.useEffect(() => {
        if (isModalOpen) {
          document.body.style.overflow = "hidden";
          
        } else {
          document.body.style.overflow = "auto";
        }
    
        return () => {
          document.body.style.overflow = "auto";
        };
      }, [isModalOpen]);

    async function handleReviewSubmit(e: React.FormEvent){
        e.preventDefault();
        const starRatingStatement = document.getElementById(`statement`);
        let errorsCount = 0;

        //validation checks
        if(starRatingStatement){
            if(starRatingStatement.innerText.length === 0){
                document.querySelector('#rating-error')?.classList.remove('hidden');
            }
        }

        const errors = document.querySelectorAll(`[id$=error]`);

        errors.forEach(error => {
            if(!error.classList.contains('hidden')){
                errorsCount++;
            }
          });

        if(errorsCount > 0){
            return toast.error('The values entered are invalid');

        }

        try {
            setLoader(true);
            await axios.post(`/api/products/${product}/update`, {
                rating: starRatingStatement ? getRating(starRatingStatement.innerText) : 0,
                email,
                name,
                review: review.length > 0 ? review : mediaBase64,
                headline,
                isMedia: review.length === 0
            });
        } catch (error: any) {
            toast.error(error.message);
        }finally{
            setLoader(false);
            location.replace(location.href.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)[1]);
        }

    }

  return <section className={`font-sans flex flex-col items-center gap-y-5 w-full py-7`}>
    <header className="text-2xl flex flex-row w-full justify-start">
        <h2>CUSTOMER REVIEWS</h2>
    </header>
    {reviews.length > 0 ? <div className='w-full pt-6 flex flex-col gap-y-7'>
        <header className='w-full flex lg:flex-row flex-col justify-center relative bg-detail-500/5 py-4 h-28'>
            <section className='flex flex-row items-center gap-x-4'>
                <h1 className='text-5xl text-detail-500 font-light'>{averageRating}</h1>
                <div className='inline-flex flex-col gap-y-[5px]'>
                    <ul className="flex flex-row items-center gap-x-1">
                        {Array.from({ length: averageRating }).map((_, i) => (
                            <li><i key={i} className='fa-solid fa-star text-xl text-yellow-400'></i></li>
                        ))}
                        {Array.from({ length: 5 - averageRating }).map((_, i) => (
                            <li><i key={i} className='fa-regular fa-star text-xl text-yellow-400'></i></li>
                        ))}
                    </ul> 
                    <p className='text-[1rem] text-detail-500 font-light'>Based on {reviews.length} review(s)</p>
                </div>
            </section>
            <button onClick={() => setIsModalOpen(true)} className='px-5 py-1 absolute right-6 top-[38%] rounded-3xl bg-detail-500 text-white outline-none hover:ring-1 hover:ring-detail-500 text-[0.9rem]'>Write A Review</button>
        </header>
        <section className='lg:w-[36%] w-full flex flex-row lg:justify-start items-center text-sm gap-x-2'>
            <div className="relative inline-block w-[50%]">
                <button 
                onClick={(e) => {
                    let downAngle = e.currentTarget.querySelector("button i.in-dropdown");
                    let ratingsDropdown = document.getElementById("ratings-dropdown");
                    if(downAngle && ratingsDropdown){
                        if(!downAngle.classList.contains("ad-rotate")){
                            downAngle.classList.add("ad-rotate");
                            downAngle.classList.remove("ad-rotate-anticlock");
                            ratingsDropdown.classList.remove('hide');
                            ratingsDropdown.classList.add('show');
                        }else{
                            downAngle.classList.remove("ad-rotate");
                            downAngle.classList.add("ad-rotate-anticlock");
                            ratingsDropdown.classList.add('hide');
                            ratingsDropdown.classList.remove('show');
                        }
                    }
                }}
                className="w-full relative text-left rounded-3xl font-medium px-3 py-2 hover:border-detail-500 focus:border-detail-500 cursor-pointer bg-white border border-gray-300">
                    {selectedRating === 'all' ?
                    'Rating'
                    : <ul className="cursor-pointer flex flex-row items-center gap-x-1">
                        {Array.from({ length: selectedRating }).map((_, i) => (
                            <li><i key={i} className='fa-solid fa-star text-lg text-yellow-400'></i></li>
                        ))}
                        {Array.from({ length: 5 - selectedRating }).map((_, i) => (
                            <li><i key={i} className='fa-regular fa-star text-lg text-yellow-400'></i></li>
                        ))}
                    </ul> }
                    <i className="fa-solid fa-angle-down in-dropdown absolute right-4 text-xs top-3"></i>
                </button>
                <ul id='ratings-dropdown' className="absolute z-30 w-full bg-white rounded-md shadow-lg flex-col p-3 hide">
                    <li onClick={(e) => handleSelect(e, 'all')} className="cursor-pointer p-3 font-semibold text-xs bg-yellow-400/10 hover:bg-yellow-400/10 flex flex-row justify-between items-center">
                        <span>All ratings</span>
                        <span className='check'><i className="fa-solid fa-check text-yellow-400 text-xs pt-1"></i></span>
                    </li>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <li
                            key={rating}
                            onClick={(e) => handleSelect(e, rating)}
                            className="cursor-pointer flex flex-row items-center justify-between p-3 hover:bg-yellow-400/10"
                        >
                            <span className='flex flex-row items-center justify-between gap-x-1 '>
                                {Array.from({ length: rating }).map((_, i) => (
                                    <i key={i} className='fa-solid fa-star text-xl text-yellow-400'></i>
                                ))}
                                {Array.from({ length: 5 - rating }).map((_, i) => (
                                    <i key={i} className='fa-regular fa-star text-xl text-yellow-400'></i>
                                ))}
                            </span>
                            <span className='hidden check'>
                                <i className="fa-solid fa-check text-yellow-400 text-xs pt-1"></i>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="relative inline-block w-[50%]">
                <button 
                onClick={(e) => {
                    let circle = e.currentTarget.querySelector("button i");
                    if(circle){
                        if(!circle.classList.contains("fa-circle-check")){
                            circle.classList.remove("fa-circle", 'fa-regular', 'text-gray-300');
                            circle.classList.add("fa-circle-check", 'fa-solid', 'text-accent');
                        }else{
                            circle.classList.add("fa-circle", 'fa-regular', 'text-gray-300');
                            circle.classList.remove("fa-circle-check", 'fa-solid', 'text-accent');
                        }
                    }
                }}
                className="w-full relative text-left rounded-3xl hover:border-detail-500 focus:border-detail-500 px-3 py-2 cursor-pointer bg-white border border-gray-300 font-medium">
                    With media<i className="fa-regular fa-circle absolute right-4 text-[1rem] text-gray-300 top-3"></i>
                </button>
            </div>
        </section>
        <div className='flex flex-row flex-wrap gap-x-2 w-full'>
            {reviews.map((review: any) => <article className='p-9 bg-detail-100 rounded-sm w-[36%] h-fit flex flex-col gap-y-4'>
                <header className='flex flex-col gap-y-6'>
                    <h2 className='flex flex-row justify-between items-center'>
                        <ul className="flex flex-row items-center gap-x-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                                <li><i key={i} className='fa-solid fa-star text-xl text-yellow-400'></i></li>
                            ))}
                            {Array.from({ length: 5 - review.rating }).map((_, i) => (
                                <li><i key={i} className='fa-regular fa-star text-xl text-yellow-400'></i></li>
                            ))}
                        </ul>
                        <h3 className='text-detail-500/50 font-sans text-[1rem]'>{`${new Date(review.createdAt).getMonth() + 1}/${new Date(review.createdAt).getDate()}/${new Date(review.createdAt).getFullYear().toString().slice(-2)}`}</h3>
                    </h2>
                    <h1 className='text-3xl text-detail-500 font-extralight'>{review.headline}</h1>
                </header>
                <p className='text-detail-500/80 font-light'>{review.content}</p>
                <div className='flex flex-row w-[35%]'>
                    <p className='text-detail-500/80 font-light'>{review.author.firstName ?? review.author.email}</p>
                    <span className='border-2 border-black border-l-0 border-t-0 border-b-0 h-1 px-1'></span>
                    {review.author.isVerified && <p><i className="fa-solid fa-circle-check text-xs text-detail-500"></i>&nbsp;Verified Reviewer</p>}
                </div>
            </article>)}
        </div>
    </div>
    : <div className='flex flex-col items-center gap-y-4 w-full pt-12'>
        <Image src={Stars} width={55} height={55} alt='Be a star'/>
        <p className='text-detail-500 font-light text-xl'>We&apos;re looking for supporters!</p>
        <p className='text-gray-500 text-lg'>Be among our tribe</p>
        <button onClick={() => setIsModalOpen(true)} className='bg-detail-500 px-4 py-2 text-white rounded-3xl hover:ring-2 hover:ring-detail-500'>Be the first to write a review!</button>
    </div>}
    {isModalOpen && <ReviewsModal classes='bg-white px-10 pb-6 pt-20 rounded-xl h-full' left='20rem' width='40rem' onClose={hideModalHandler}>
        <section className='font-sans font-light flex flex-col gap-y-11 text-gray-500 h-full'>
            <header className='text-2xl flex flex-row justify-center'>
                <h2>SHARE YOUR THOUGHTS</h2>
            </header>
            <form onSubmit={handleReviewSubmit} className='flex flex-col gap-y-11 overflow-y-auto max-h-[70vh] hide-scrollbar' encType="multipart/form-data">
                <div className='flex flex-col gap-y-3 items-start w-full'>
                    <div className='flex flex-col gap-y-7 text-lg'>
                        <label>RATE YOUR EXPERIENCE&nbsp;<sup>*</sup></label>
                        <div className='flex flex-row gap-x-4 items-center'>
                            <div className='flex flex-row gap-x-3 px-3'>
                                <i 
                                onMouseOver={(e) => {
                                    let item = e.currentTarget;
                                    let text = document.querySelector('#statement') as HTMLParagraphElement;
                                    let stars = document.querySelectorAll('[id^="star"]:not(#star1)');

                                    stars.forEach(star => {
                                        if(star.classList.contains('fa-solid')){
                                            star.classList.remove('fa-solid');
                                            star.classList.add('fa-regular');
                                        }
                                    });

                                    if(item && text){
                                        item.classList.remove('fa-regular');
                                        item.classList.add('fa-solid');
                                        text.innerText = activeMessage(1);
                                    }
                                    
                                }} 
                                onClick={(e) => setIsActive((prevState: any) => ({
                                    ...prevState,
                                    star1: true,
                                    star2: false,
                                    star3: false,
                                    star4: false,
                                    star5: false
                                }))}
                                onMouseLeave={handleMouseLeave}
                                className={`fa-regular fa-star text-4xl text-yellow-400 cursor-pointer`} id='star1'></i>
                                <i 
                                onMouseOver={(e) => {
                                    let item = e.currentTarget;
                                    let text = document.querySelector('#statement') as HTMLParagraphElement;
                                    let star1 = document.querySelector('#star1') as HTMLElement;
                                    let stars = document.querySelectorAll('[id^="star"]:not(#star1):not(#star2)');

                                    stars.forEach(star => {
                                        if(star.classList.contains('fa-solid')){
                                            star.classList.remove('fa-solid');
                                            star.classList.add('fa-regular');
                                        }
                                    });

                                    if(item && text && star1){
                                        star1.classList.remove('fa-regular');
                                        star1.classList.add('fa-solid');
                                        item.classList.remove('fa-regular');
                                        item.classList.add('fa-solid');
                                        text.innerText = 'Poor';
                                    }
                                }} 
                                onClick={(e) => setIsActive((prevState: any) => ({
                                    ...prevState,
                                    star1: true,
                                    star2: true,
                                    star3: false,
                                    star4: false,
                                    star5: false
                                }))} 
                                onMouseLeave={handleMouseLeave}
                                className={`fa-regular fa-star text-4xl text-yellow-400 cursor-pointer`} id='star2'></i>
                                <i 
                                onMouseOver={(e) => {
                                    let item = e.currentTarget;
                                    let text = document.querySelector('#statement') as HTMLParagraphElement;
                                    let star1 = document.querySelector('#star1') as HTMLElement;
                                    let star2 = document.querySelector('#star2') as HTMLElement;
                                    let stars = document.querySelectorAll('[id^="star"]:not(#star1):not(#star2):not(#star3)');

                                    stars.forEach(star => {
                                        if(star.classList.contains('fa-solid')){
                                            star.classList.remove('fa-solid');
                                            star.classList.add('fa-regular');
                                        }
                                    });
                                    if(item && text && star1 && star2){
                                        star1.classList.remove('fa-regular');
                                        star1.classList.add('fa-solid');
                                        star2.classList.remove('fa-regular');
                                        star2.classList.add('fa-solid');
                                        item.classList.remove('fa-regular');
                                        item.classList.add('fa-solid');
                                        text.innerText = 'Average';
                                    }
                                }} 
                                onClick={(e) => setIsActive((prevState: any) => ({
                                    ...prevState,
                                    star1: true,
                                    star2: true,
                                    star3: true,
                                    star4: false,
                                    star5: false
                                }))} 
                                onMouseLeave={handleMouseLeave}
                                className={`fa-regular fa-star text-4xl text-yellow-400 cursor-pointer`} id='star3'></i>
                                <i 
                                onMouseOver={(e) => {
                                    let item = e.currentTarget;
                                    let text = document.querySelector('#statement') as HTMLParagraphElement;
                                    let star1 = document.querySelector('#star1') as HTMLElement;
                                    let star2 = document.querySelector('#star2') as HTMLElement;
                                    let star3 = document.querySelector('#star3') as HTMLElement;
                                    let stars = document.querySelectorAll('[id^="star"]:not(#star1):not(#star2):not(#star3):not(#star4)');

                                    stars.forEach(star => {
                                        if(star.classList.contains('fa-solid')){
                                            star.classList.remove('fa-solid');
                                            star.classList.add('fa-regular');
                                        }
                                    });
                                    
                                    if(item && text && star1 && star2 && star3){
                                        star1.classList.remove('fa-regular');
                                        star1.classList.add('fa-solid');
                                        star2.classList.remove('fa-regular');
                                        star2.classList.add('fa-solid');
                                        star3.classList.remove('fa-regular');
                                        star3.classList.add('fa-solid');
                                        item.classList.remove('fa-regular');
                                        item.classList.add('fa-solid');
                                        text.innerText = 'Good';
                                    }
                                }}
                                onClick={(e) => setIsActive((prevState: any) => ({
                                    ...prevState,
                                    star1: true,
                                    star2: true,
                                    star3: true,
                                    star4: true,
                                    star5: false
                                }))}
                                onMouseLeave={handleMouseLeave}
                                className={`fa-regular fa-star text-4xl text-yellow-400 cursor-pointer`} id='star4'></i>
                                <i 
                                onMouseOver={(e) => {
                                    let item = e.currentTarget;
                                    let text = document.querySelector('#statement') as HTMLParagraphElement;
                                    let star1 = document.querySelector('#star1') as HTMLElement;
                                    let star2 = document.querySelector('#star2') as HTMLElement;
                                    let star3 = document.querySelector('#star3') as HTMLElement;
                                    let star4 = document.querySelector('#star4') as HTMLElement;
                                    if(item && text && star1 && star2 && star3 && star4){
                                        star1.classList.remove('fa-regular');
                                        star1.classList.add('fa-solid');
                                        star2.classList.remove('fa-regular');
                                        star2.classList.add('fa-solid');
                                        star3.classList.remove('fa-regular');
                                        star3.classList.add('fa-solid');
                                        star4.classList.remove('fa-regular');
                                        star4.classList.add('fa-solid');
                                        item.classList.remove('fa-regular');
                                        item.classList.add('fa-solid');
                                        text.innerText = 'Great';
                                    }
                                }}
                                onClick={(e) =>  setIsActive((prevState: any) => ({
                                    ...prevState,
                                    star1: true,
                                    star2: true,
                                    star3: true,
                                    star4: true,
                                    star5: true
                                }))}
                                onMouseLeave={handleMouseLeave}
                                className={`fa-regular fa-star text-4xl text-yellow-400 cursor-pointer`} id='star5'></i>
                            </div>
                            <p id='statement' className='text-[1rem]'></p>
                        </div>
                    </div>
                    <p id='rating-error' className="text-red-600 text-xs font-sans hidden -mt-1">A star rating is required</p>
                </div>
                <div className='flex flex-col gap-y-2 w-full items-start'>
                    <label htmlFor='review' className='flex flex-row items-center gap-x-2'>
                        <h3 className='text-lg'>WRITE A REVIEW&nbsp;<sup>*</sup></h3>
                        <div className='inline-block text-sm'>
                            <label htmlFor='file' className='underline cursor-pointer'>or upload a review</label>
                            <input type='file' onChange={(e) => handleFileChange(e)} id="file" className='hidden' name="file" accept=".txt, .doc, .docx, .DOCX, .pdf, audio/*, video/*"></input>
                        </div>
                    </label>
                    <div id="preview" className='w-full hidden'></div>
                    <textarea
                        onBlur={(e) => {
                            const file = document.getElementById('file') as HTMLInputElement;
                            if(file){
                                if(e.target.value.length === 0 ||  file.value.length === 0){
                                    document.querySelector('#review-error')?.classList.remove('hidden');
                                }else{
                                    document.querySelector('#review-error')?.classList.add('hidden');
                                }
                            }
                        }}
                        onChange={(e) => setReview(e.target.value)}
                        value={review}
                        name='review' 
                        id='review' 
                        placeholder='Tell us what you like or dislike' 
                        className='border border-gray-500 p-2 focus:shadow-lg focus:outline-none text-lg w-full' 
                        rows={4} 
                        cols={50}>
                    </textarea>
                    <p id='review-error' className="text-red-600 text-xs font-sans hidden -mt-1">Review content is required</p>
                </div>
                <div className='flex flex-col gap-y-2 w-full items-start'>
                    <label htmlFor='headline' className='text-lg'>ADD A HEADLINE&nbsp;<sup>*</sup></label>
                    <input onBlur={(e) => {
                        if(e.target.value.length === 0){
                            document.querySelector('#headline-error')?.classList.remove('hidden');
                        }else{
                            document.querySelector('#headline-error')?.classList.add('hidden');
                        }
                        
                    }} name='headline' id='headline' placeholder='Summarize your experience' className='border border-gray-500 p-2 h-10 focus:shadow-lg focus:outline-none text-lg w-full'/>
                <p id='headline-error' className="text-red-600 text-xs font-sans hidden -mt-1">A name is required</p>
                </div>
                <div className='flex flex-row w-full'>
                    <div className='flex flex-col gap-y-2 text-lg w-[47.5%]'>
                        <label htmlFor='name'>FULL NAME&nbsp;<sup>*</sup></label>
                        <input 
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        onBlur={(e) => {
                            if(e.target.value.length === 0){
                                document.querySelector('#name-error')?.classList.remove('hidden');
                            }else{
                                document.querySelector('#name-error')?.classList.add('hidden');
                            }
                        }} name='name' id='name' className='border text-sm border-gray-500 p-2 h-10 focus:shadow-lg focus:outline-none'/>
                        <p id='name-error' className="text-red-600 text-xs font-sans hidden -mt-1">A name is required</p>
                    </div>
                    <div className='w-[5%]'></div>
                    <div className='flex flex-col gap-y-2 text-lg w-[47.5%]'>
                        <label htmlFor='email'>YOUR EMAIL ADDRESS&nbsp;<sup>*</sup></label>
                        <input 
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        onBlur={(e) => {
                            if(!e.target.value.includes("@")){
                                document.querySelector('#email-error')?.classList.remove('hidden');
                            }else{
                                document.querySelector('#email-error')?.classList.add('hidden');
                            }
                        }}  name='email' id='email' className='border text-sm border-gray-500 p-2 h-10 focus:shadow-lg focus:outline-none'/>
                        <p className='text-xs -mt-1'>Will send you an email to verify this review came from you.</p>
                        <p id='email-error' className="text-red-600 text-xs font-sans hidden -mt-1">An email is required</p>
                    </div>
                </div>
                <div className='flex flex-row justify-between items-center pl-2'>
                    <p className='text-sm'><sup>*</sup>&nbsp;required fields</p>
                    <button type='submit' className='px-10 py-2 rounded-md bg-black text-white outline-none'>{loader ? 'Processing' : 'Send'}</button>
                </div>
            </form>
        </section>
    </ReviewsModal>}
  </section>;
};


export default Reviews;