"use client"
import Image from 'next/image';
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaArrowRight, FaInfo, FaRegTrashAlt } from "react-icons/fa";
interface filetypes {
    success: boolean
    time: Date,
    url: string,
    // data: {
    //   message: ["File uploaded successfully"],
    //   baseurl: "",
    //   files: [updatedPathString],
    //   isImage: [true],
    //   code: 220,
    // },
}
export const Compress = () => {
    const [images, setImages] = useState<[] | File[]>([]);
    const [compressedImages, setCompressedImages] = useState<[] | filetypes[]>([]);
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
        setImages(prevImages => [...prevImages, ...acceptedFiles]);
    }, [])
    const handleDeleteImage = (index: Number) => {
        // Remove the image at the specified index
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };
    const compressImages = () => {
        let folderName = Date.now().toString();
        try {
            const promises = images.map(async (image) => {
                const formData = new FormData();
                formData.append('image', image);
                formData.append("folderName", folderName);
                const res = await fetch('/api/compress', {
                    method: 'POST',
                    body: formData,
                    cache: 'no-cache',
                })
                let data = await res.json();
                if (data.success) {
                    return data
                }
                throw new Error(data.message)
            })
            Promise.all(promises).then((compressedImages) => {
                setCompressedImages(compressedImages);
                images.length = 0;
            })
        } catch (error) {
            console.log(error)
            return error
        }

    }
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    return (
        <div className='text-center '>
            <div >
                <div className={`border-2 rounded-lg border-dashed h-[40vh] grid place-items-center ${isDragActive ? "border-blue-700" : ""}`} {...getRootProps()} >
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <p>Drop the files here ...</p> :
                            <p>Drag and drop some Images here , or click to select files</p>
                    }
                </div>
                <button className='bg-blue-700 px-3 py-3 rounded-[50vmax] gap-2 text-md mt-6 flex justify-center items-center w-full ' onClick={compressImages}> Compress Now <FaArrowRight /></button>
                <div className="border-2 p-4 rounded-2xl mt-4 border-dotted">

                    <div className='grid grid-cols-2 gap-3 '>
                        {images.map((file, index) => (
                            <div key={index} className='relative gradient-chess h-[300px] rounded-xl'>
                                <Image src={URL.createObjectURL(file)} alt={`Preview ${file.name}`} width={300} height={300} className='object-cover h-[300px]' />
                                <button className='absolute bottom-0 left-0 bg-green-600 p-4'><FaInfo size={30} /></button>
                                <button onClick={() => handleDeleteImage(index)} className='absolute bottom-0 right-0 bg-red-600 p-4'><FaRegTrashAlt size={30} /></button>
                            </div>
                        ))}
                        {compressedImages &&
                            compressedImages.map((file, index) => (
                                <div key={index} className='relative gradient-chess h-[100px]'>
                                    <Image src={file.url} alt={`Preview ${file.url}`} width={300} height={300} className='object-cover h-[100px]' />
                                    <a href={file.url} download={file.url.split("_ayush_")[1]} className='absolute bottom-0 right-0 bg-green-600 px-2 py-1 inline-block'>Download Image</a>
                                </div>
                            ))

                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
