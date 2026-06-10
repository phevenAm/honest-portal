import styles from './Footer.module.scss'

export default function Footer() {


    const d = new Date().getFullYear().toString()
    console.log(d)
    return (
        <footer className={styles.footer}><span><em>Abide:</em> WithMe </span> <span>{d}</span></footer>

    )
    
}