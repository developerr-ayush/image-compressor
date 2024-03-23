"use client"
import React, { useEffect, useState } from 'react'
import { Compress } from './Compress'

const Hero = () => {
    let images = ["png", "jpg", "webp"];
    let [text, setText] = useState("png")
    // typing effect 
    function changeText() {
        let i = 0;
        setInterval(() => {
            setText(images[i]);
            i++;
            if (i === images.length) {
                i = 0;
            }
        }, 2000);
    }
    useEffect(() => {
        changeText()
    }, [])
    return (
        <div className='py-4 px-10 items-center min-h-screen gap-5 grid md:grid-cols-2 '>
            <div >
                <h3 className='text-[2.5rem] font-medium lg:text-[3.8rem]'>Looseless</h3>
                <h3 className='text-[2.5rem] font-medium lg:text-[3.8rem]'><span className='text-blue-700 font-bold'>{text.toUpperCase()}</span> Compression</h3>
                <h3 className='text-[2.5rem] font-medium lg:text-[3.8rem]'>Magic Unlocked.</h3>
            </div>
            <div >

                <Compress />
            </div>
        </div>
    )
}

export default Hero