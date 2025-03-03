import Link from "next/link"
import Image from "next/image"
import styles from './navbar.module.css'

interface NavbarProps {
  showAuthButtons?: boolean
  showUserProfile?: boolean
}

export function Navbar({ showAuthButtons = true, showUserProfile = false }: NavbarProps) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo}>
            <Image 
              src="/placeholder.svg?height=50&width=50" 
              alt="Dental Care Logo" 
              width={50} 
              height={50}
              className={styles.logoImage}
            />
            <span className={styles.logoText}>DENTAL CARE</span>
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/services" className={styles.navLink}>Services</Link>
          <Link href="/blogs" className={styles.navLink}>Blogs</Link>
          <Link href="/about" className={styles.navLink}>About</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
        </nav>
        
        <div className={styles.authContainer}>
          {showUserProfile && (
            <div className={styles.userProfile}>
              <Image 
                src="/placeholder.svg?height=40&width=40" 
                alt="User Profile" 
                width={40} 
                height={40}
                className={styles.userAvatar}
              />
              <button className={`btn btn-primary ${styles.aiCheckupBtn}`}>
                AI Checkup
              </button>
            </div>
          )}
          
          {showAuthButtons && (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.loginLink}>Login</Link>
              <Link href="/signup" className={`btn btn-primary ${styles.signupBtn}`}>Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
