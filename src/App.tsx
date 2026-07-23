import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const TAKEAWAY_URL = 'https://www.takeaway.com/be-fr/menu/latelier-a-pizza-helmet'
const UBER_URL = 'https://www.ubereats.com/be/store/latelier-a-pizza/UtHUh_htXI-n2J-74GDFgw'
const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Chauss%C3%A9e+de+Helmet+315+1030+Schaerbeek'
const DESTINATION = encodeURIComponent('L’Atelier à Pizza, Chaussée de Helmet 315, 1030 Schaerbeek')

const directionServices = [
  {
    name: 'Google Maps',
    href: `https://www.google.com/maps/dir/?api=1&destination=${DESTINATION}&travelmode=driving&dir_action=navigate`,
  },
  {
    name: 'Waze',
    href: `https://www.waze.com/ul?q=${DESTINATION}&navigate=yes`,
  },
  {
    name: 'Plans',
    href: `https://maps.apple.com/?daddr=${DESTINATION}&dirflg=d`,
  },
]

const pizzas = [
  { name: "L’Atelier", price: '9,90', note: 'La signature', ingredients: 'Crème, mozzarella, jambon de dinde, pommes de terre, oignons rouges' },
  { name: 'Western', price: '9,00', note: 'L’urbaine', ingredients: 'Tomate, mozzarella, poulet, oignons rouges, sauce BBQ' },
  { name: 'Parmigiana', price: '8,50', note: 'La végétale', ingredients: 'Tomate, mozzarella, parmesan, aubergines, basilic' },
  { name: 'Tajmahal', price: '9,00', note: 'La relevée', ingredients: 'Tomate, crème, mozzarella, poulet épicé, poivrons, olives' },
  { name: 'Quatre fromages', price: '8,50', note: 'La fondante', ingredients: 'Tomate, mozzarella, parmesan, gorgonzola, chèvre' },
  { name: 'Margherita', price: '8,00', note: 'L’essentielle', ingredients: 'Sauce tomate, mozzarella' },
]

const hours = [
  ['Lundi', 'Fermé'],
  ['Mardi — Jeudi', '12:00–14:30 · 17:00–22:30'],
  ['Vendredi', '16:00–23:00'],
  ['Samedi', '12:00–23:00'],
  ['Dimanche', '12:00–22:30'],
]

function DirectionsPicker() {
  const [open, setOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="directions-picker" ref={pickerRef}>
      <button
        className="button button-ghost directions-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="directions-menu"
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        S’y rendre <span aria-hidden="true">⌖</span>
      </button>
      {open && (
        <motion.div
          id="directions-menu"
          className="directions-menu"
          role="menu"
          aria-label="Choisir une application d’itinéraire"
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          <p>Itinéraire depuis votre position</p>
          {directionServices.map((service) => (
            <a
              key={service.name}
              href={service.href}
              target="_blank"
              rel="noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <span>{service.name}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </motion.div>
      )}
    </div>
  )
}

function OrderLinks({ compact = false, directions = false }: { compact?: boolean, directions?: boolean }) {
  return (
    <div className={compact ? 'order-links compact' : 'order-links'}>
      <a className="button button-primary" href={TAKEAWAY_URL} target="_blank" rel="noreferrer">
        Commander sur Takeaway <span aria-hidden="true">↗</span>
      </a>
      <a className="button button-ghost" href={UBER_URL} target="_blank" rel="noreferrer">
        Uber Eats <span aria-hidden="true">↗</span>
      </a>
      {directions && <DirectionsPicker />}
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const imageScale = useTransform(scrollYProgress, [0, 0.38], [1, 1.08])
  const heroTextY = useTransform(scrollYProgress, [0, 0.28], [0, 70])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="L’Atelier à Pizza — accueil">
          <span className="wordmark-small">L’Atelier</span>
          <span className="wordmark-main">à Pizza</span>
        </a>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="#menu">La carte</a>
          <a href="#atelier">L’atelier</a>
          <a href="#infos">Infos</a>
          <a className="nav-order" href={TAKEAWAY_URL} target="_blank" rel="noreferrer">Commander <span>↗</span></a>
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-nav">
          <span className="sr-only">Ouvrir le menu</span>
          <span>{menuOpen ? 'Fermer' : 'Menu'}</span>
        </button>
        {menuOpen && (
          <motion.nav id="mobile-nav" className="mobile-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <a href="#menu" onClick={() => setMenuOpen(false)}>La carte</a>
            <a href="#atelier" onClick={() => setMenuOpen(false)}>L’atelier</a>
            <a href="#infos" onClick={() => setMenuOpen(false)}>Infos pratiques</a>
            <a href={TAKEAWAY_URL} target="_blank" rel="noreferrer">Commander ↗</a>
          </motion.nav>
        )}
      </header>

      <section className="hero" id="top">
        <motion.img className="hero-image" src="/atelier-pizza-hero.webp" alt="Pizza artisanale aux légumes sortant du four" width="1672" height="941" fetchPriority="high" style={{ scale: imageScale }} />
        <div className="hero-shade" />
        <motion.div className="hero-copy" style={{ y: heroTextY }} initial="hidden" animate="visible" variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.11, delayChildren: 0.18 } },
        }}>
          <motion.p className="eyebrow" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}>Pizzeria halal · Schaerbeek</motion.p>
          <motion.h1 variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } }}>
            La pâte maison.<br />Le plaisir immédiat.
          </motion.h1>
          <motion.p className="hero-intro" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            Des pizzas généreuses, préparées à Helmet et livrées encore chaudes.
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}><OrderLinks directions /></motion.div>
        </motion.div>
        <div className="hero-foot">
          <span>Chaussée de Helmet 315</span>
          <span className="scroll-cue"><i /> Découvrez la carte</span>
        </div>
      </section>

      <section className="proof" aria-label="Nos engagements">
        <p>Pâte 100% maison</p><span>✦</span><p>Ingrédients halal</p><span>✦</span><p>Sur place · à emporter · livré</p>
      </section>

      <section className="menu-section" id="menu">
        <motion.div className="section-heading" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }}>
          <div>
            <p className="eyebrow dark">Nos incontournables</p>
            <h2>Six bonnes raisons<br />de ne pas cuisiner.</h2>
          </div>
          <p className="section-aside">Petite, moyenne ou large : choisissez votre faim. Prix affichés à partir du format S.</p>
        </motion.div>
        <div className="menu-list">
          {pizzas.map((pizza, index) => (
            <motion.div className="menu-row" key={pizza.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} viewport={{ once: true, amount: 0.7 }}>
              <span className="menu-number">0{index + 1}</span>
              <div className="menu-name"><h3>{pizza.name}</h3><span>{pizza.note}</span></div>
              <p>{pizza.ingredients}</p>
              <strong>{pizza.price} €</strong>
            </motion.div>
          ))}
        </div>
        <div className="menu-action">
          <a href={TAKEAWAY_URL} target="_blank" rel="noreferrer">Voir toute la carte <span>↗</span></a>
          <p>Pizzas, pâtes, plats gratinés, salades et gourmandises.</p>
        </div>
      </section>

      <section className="atelier-section" id="atelier">
        <div className="atelier-visual" aria-hidden="true">
          <motion.div className="red-disc" initial={{ scale: 0.75, rotate: -8 }} whileInView={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 80 }} viewport={{ once: true, amount: 0.5 }}>
            <span>100%</span><small>fait maison</small>
          </motion.div>
          <div className="flour-mark">A</div>
        </div>
        <motion.div className="atelier-copy" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.45 }}>
          <p className="eyebrow">Notre manière</p>
          <h2>Un atelier,<br />pas une usine.</h2>
          <p>Chaque pizza commence par une pâte préparée maison, façonnée à la commande, puis généreusement garnie. Ici, on vient pour manger vrai — simplement.</p>
          <dl>
            <div><dt>4,9/5</dt><dd>sur Takeaway</dd></div>
            <div><dt>1 800+</dt><dd>avis laissés</dd></div>
          </dl>
        </motion.div>
      </section>

      <section className="quote-section">
        <motion.blockquote initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }}>
          “Les pizzas arrivent toujours très chaudes. Qualité et livraison excellentes !”
          <footer>— Avis client Takeaway</footer>
        </motion.blockquote>
      </section>

      <section className="info-section" id="infos">
        <div className="info-intro">
          <p className="eyebrow dark">Passez nous voir</p>
          <h2>À Helmet,<br />quand la faim sonne.</h2>
          <a className="text-link" href={MAP_URL} target="_blank" rel="noreferrer">Ouvrir l’itinéraire <span>↗</span></a>
        </div>
        <div className="info-grid">
          <div className="info-block">
            <span className="info-label">Adresse</span>
            <address>Chaussée de Helmet 315<br />1030 Schaerbeek</address>
          </div>
          <div className="info-block">
            <span className="info-label">Contact</span>
            <a href="tel:+3222421300">02 242 13 00</a>
            <p>Sur place · à emporter · livraison</p>
          </div>
          <div className="info-block hours-block">
            <span className="info-label">Horaires</span>
            <div className="hours">
              {hours.map(([day, time]) => <div key={day}><span>{day}</span><strong>{time}</strong></div>)}
            </div>
            <small>Les horaires peuvent varier les jours fériés.</small>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-pattern" aria-hidden="true">Pizza · Pasta · Pizza · Pasta ·</div>
        <div className="final-content">
          <p className="eyebrow">Ce soir, on s’en charge.</p>
          <h2>Votre pizza<br />est à deux clics.</h2>
          <OrderLinks compact />
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand"><span>L’Atelier</span><strong>à Pizza</strong></div>
        <div><p>Chaussée de Helmet 315<br />1030 Schaerbeek</p></div>
        <div className="footer-links"><a href={TAKEAWAY_URL} target="_blank" rel="noreferrer">Takeaway ↗</a><a href={UBER_URL} target="_blank" rel="noreferrer">Uber Eats ↗</a><a href="tel:+3222421300">02 242 13 00</a></div>
        <p className="copyright">© {new Date().getFullYear()} L’Atelier à Pizza</p>
      </footer>
    </main>
  )
}

export default App
