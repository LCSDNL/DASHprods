import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/solid';
import rsWelcome from '../assets/RS-Welcome.png' // ajuste o caminho se necessário



export default function CanalVendas() {

    const navigate = useNavigate()


  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen bg-gray-900 text-white pt-20">
        <header className="fixed top-0 left-0 w-full bg-gray-900 z-50 shadow-md p-2 flex items-center justify-center border-b border-red-600">
            <button
            onClick={() => navigate('/')}
            className="absolute left-4 p-2 rounded hover:bg-gray-800"
            >
                <HomeIcon className="h-8 w-8 text-white" />
            </button>
                <img src={rsWelcome} alt="Bem-vindo RS" className="h-12 object-contain" />
        </header>
    </div>
    )
}
