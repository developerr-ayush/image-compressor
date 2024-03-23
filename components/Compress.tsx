"use client"
import Image from 'next/image';
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { BsDownload } from 'react-icons/bs';
import { CgClose } from 'react-icons/cg';
import { FaArrowRight, FaCheck, FaInfo, FaRegTrashAlt } from "react-icons/fa";
interface filetypes {
    success: boolean
    time: Date,
    url: string,
    zip: string,
    initialData: {
        name: string,
        size: number,
    },
    compressedData: {
        name: string,
        size: number,
    },
}
interface message {
    message: string
    success: boolean,
    data: filetypes[]
}
export const Compress = () => {
    const [images, setImages] = useState<[] | File[]>([]);
    const [compressedImages, setCompressedImages] = useState<[] | filetypes[]>([]);
    const [pending, setPending] = useState(false);
    const [zip, setZip] = useState("")
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
        setImages(prevImages => [...prevImages, ...acceptedFiles]);
    }, [])
    const handleDeleteImage = (index: Number) => {
        // Remove the image at the specified index
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };
    const compressImages = async () => {
        setPending(true)
        try {
            const formData = new FormData();
            images.forEach((image, index) => {
                formData.append(`image[${index}]`, image);
            })
            formData.append('totalImages', images.length.toString())
            const res = await fetch('/api/compress', {
                method: 'POST',
                body: formData,
                cache: 'no-cache',
            })
            let data = await res.json();
            setCompressedImages(data.data)
            setZip(data.zip)
            if (data.success) {
                return data
            }
            setPending(false)
            throw new Error(data.message)
        } catch (error) {
            setPending(false)
            return error
        }

    }
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: {
            'image/png': ['.png'],
            'image/jpg': ['.jpg'],
            'image/webp': ['.webp'],
            'image/jpeg': ['.jpeg'],
            'image/gif': ['.gif'],
        }
    })
    return (
        <div className='text-center '>
            <div >
                {!compressedImages.length && <div className={`border-2 rounded-lg border-dashed h-[20rem] grid place-items-center ${isDragActive ? "border-blue-700" : ""}`} {...getRootProps()} >
                    <input accept='images/*' {...getInputProps()} />
                    {
                        isDragActive ?
                            <p>Drop the files here ...</p> :
                            <div>
                                <p>
                                    Click to upload or Drop giles here
                                </p>
                                <p className='opacity-70'>PNG, JPG, WEBP, or GIF</p>
                            </div>
                    }
                </div>}
                {!!compressedImages.length && <div className="border border-dashed rounded-lg h-[20rem] grid place-items-center">
                    <div className="flex flex-col items-center">
                        <div className="icon aspect-square rounded-[50%] bg-green-600 p-5 mb-5" >
                            <FaCheck size={30} />
                        </div>
                        <p className="text-xl">Total images: <b>{compressedImages.length}</b></p>
                        <p>Orignal Size: {
                            ((compressedImages.reduce((acc, curr) => acc + curr.initialData.size, 0) / 1024) / 1024).toFixed(2)
                        } MB</p>
                        <p>Compressed Size: {
                            ((compressedImages.reduce((acc, curr) => acc + curr.compressedData.size, 0) / 1024) / 1024).toFixed(2)
                        } MB</p>
                        <p>Congrats your Images are {
                            (
                                100 - (
                                    compressedImages.reduce((acc, curr) => acc + curr.compressedData.size, 0) /
                                    compressedImages.reduce((acc, curr) => acc + curr.initialData.size, 0)
                                ) * 100
                            ).toFixed(2)

                        }% smaller</p>
                        <div className="flex gap-2">
                            <a href={zip} className='bg-blue-700 p-2 rounded-md gap-2 text-md mt-6 flex justify-center items-center w-full' download><BsDownload /> Download Zip</a>
                        </div>
                    </div>
                </div>}
                {!!images.length || !!compressedImages.length ? (<div className=" rounded-2xl mt-4 border-dotted">

                    <div className='gap-3 grid grid-cols-1 md:grid-cols-2'>
                        {!compressedImages.length && images.map((file, index) => (
                            <div key={index} className=' bg-slate-800 relative flex   w-full rounded-xl flex-shrink-0 min-[100px] flex-grow '>
                                <Image src={URL.createObjectURL(file)} alt={`Preview ${file.name}`} width={100} height={100} className='object-cover aspect-video w-[100px] rounded-lg flex-shrink-0' />
                                <div className="content flex justify-between  flex-1 truncate">
                                    <div className="text-left p-3 left truncate">
                                        <p className='text-[0.8rem] truncate mb-1' title={file.name}>{file.name}</p>
                                        <p className=''>{Math.floor(file.size / 1024)}KB</p>
                                    </div>
                                    <button onClick={() => handleDeleteImage(index)} className='ml-auto p-4 flex-shrink-0'><CgClose size={16} /></button>
                                </div>
                            </div>
                        ))}
                        {compressedImages &&
                            compressedImages.map((file, index) => (
                                <div key={index} className=' bg-slate-800 relative flex   w-full rounded-xl flex-shrink-0 min-[100px] flex-grow '>
                                    <Image src={file.url} alt={`Preview ${file.compressedData.name}`} width={100} height={100} className='object-cover aspect-video w-[100px] rounded-lg ' />
                                    <div className="content flex justify-between items-center w-full ">
                                        <div className="text-left p-3 left truncate">
                                            <p className='text-[0.8rem] truncate mb-1' title={file.initialData.name}>{file.initialData.name}</p>
                                            <p className=''>
                                                <em>{Math.floor(file.initialData.size / 1024)}KB</em> &nbsp;~&nbsp;
                                                <b>{Math.floor(file.compressedData.size / 1024)}KB</b>
                                            </p>
                                        </div>
                                        <a href={file.url} download className='ml-auto p-4 flex-shrink-0'><BsDownload size={25} /></a>
                                    </div>
                                </div>
                            ))

                        }
                    </div>
                </div>) : ""}
                {!compressedImages.length &&
                    <button className='bg-blue-700 px-3 py-3 rounded-[50vmax] gap-2 text-md mt-6 flex justify-center items-center w-full disabled:pointer-events-none disabled:opacity-50' disabled={pending || !images.length} onClick={compressImages}>
                        {pending &&
                            <div
                                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                                role="status">
                                <span
                                    className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                                >Loading...</span>
                            </div>}
                        Compress Now <FaArrowRight /></button>
                }
            </div>
        </div>
    )
}
