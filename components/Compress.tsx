"use client"
import Image from 'next/image';
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components';
const getColor = (props: any) => {
    if (props.isDragAccept) {
        return '#00e676';
    }
    if (props.isDragReject) {
        return '#ff1744';
    }
    if (props.isFocused) {
        return '#2196f3';
    }
    return '#eeeeee';
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: transparent;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
  width:100%;
`;
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
        const promises = images.map(async (image) => {
            const formData = new FormData();
            formData.append('image', image);
            formData.append("folderName", folderName);
            const res = await fetch('/api/compress', {
                method: 'POST',
                body: formData,
                cache: 'no-cache',
            })
            return res.json();
        })
        Promise.all(promises).then((compressedImages) => {
            setCompressedImages(compressedImages);
            images.length = 0;
        })

    }
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    return (
        <div className='text-center w-[30rem] max-full'>
            <div className="mb-3">

                <h2>Welcome to Image Compressor</h2>
                <p>Created by ayush</p>
            </div>
            <div className="container">
                <Container {...getRootProps()} >
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <p>Drop the files here ...</p> :
                            <p>Drag and drop some files here, or click to select files</p>
                    }
                </Container>
                <button className='bg-blue-700 px-3 py-1 mt-6' onClick={compressImages}> Compress All Images</button>
                <div className='grid grid-cols-3 gap-3 mt-6'>
                    {images.map((file, index) => (
                        <div key={index} className='relative gradient-chess h-[100px]'>
                            <Image src={URL.createObjectURL(file)} alt={`Preview ${file.name}`} width={300} height={300} className='object-cover h-[100px]' />
                            <button onClick={() => handleDeleteImage(index)} className='absolute bottom-0 right-0 bg-red-600 px-2 py-1'>Delete</button>
                        </div>
                    ))}
                    {compressedImages &&
                        compressedImages.map((file, index) => (
                            <div key={index} className='relative gradient-chess h-[100px]'>
                                <Image src={file.url} alt={`Preview ${file.url}`} width={300} height={300} className='object-cover h-[100px]' />
                                <a href={file.url} download className='absolute bottom-0 right-0 bg-green-600 px-2 py-1 inline-block'>Download Image</a>
                            </div>
                        ))

                    }
                </div>
            </div>
        </div>
    )
}
