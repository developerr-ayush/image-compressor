import Image from 'next/image'
import React from 'react'

export const Header = () => {
    return (
        <header className='w-full text-center px-4 absolute top-0 '>
            <Image width={100} height={50} src="/logo.png" alt="Logo" />
        </header>
    )
}
