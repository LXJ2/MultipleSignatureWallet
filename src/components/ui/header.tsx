
'use client'

import { useState, useEffect } from 'react'
import styles from '../../styles/Nav.module.css'
import MobileMenu from './mobile-menu'
import Connect from "../connect/connect";
import logo from "../../assets/images/logo.svg"

export default function Header() {

  const [top, setTop] = useState<boolean>(true)


  // detect whether user has scrolled the page down by 10px
  const scrollHandler = () => {
    window.pageYOffset > 10 ? setTop(false) : setTop(true)
  }

  useEffect(() => {
    scrollHandler()
    window.addEventListener('scroll', scrollHandler)
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [top])

  return (
    <header className={`fixed w-full z-30 ${!top ? 'backdrop-blur-sm shadow-lg' : ''}`}>
      <div className="max-w-8xl mx-auto px-5 pr-[90px]">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Site branding */}
          <div className="shrink-0 mr-4 flex items-center justify-between text-white">
            <div className={styles.title}>
              <img src={logo} alt="" width={30} height={30} />
              MTXO
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">
            {/* Desktop sign in links */}
            <ul className="flex grow justify-end flex-wrap items-center mb-[15px]">
              <Connect />
            </ul>
          </nav>
          <MobileMenu />

        </div>
      </div>
    </header>
  )
}
