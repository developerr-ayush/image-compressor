import Image from 'next/image'
import React from 'react'

export const Header = () => {
    return (
        <header>
            <Image width={100} height={50} src="/logo.png" alt="Logo" />
        </header>
    )
}
