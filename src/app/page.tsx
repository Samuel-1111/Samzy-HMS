import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { hospital } from "@/lib/hospital";

const services = [
  { icon: "✚", title: "Laboratory Services", text: "Comprehensive diagnostic testing to support accurate and timely clinical decisions." },
  { icon: "♡", title: "Maternity and Gyne Care", text: "Maternity and gynaecological services, including prenatal care, childbirth education and postnatal support." },
  { icon: "⌕", title: "Ultra Sound Scanning", text: "Ultrasound scanning services that provide crucial imaging for various medical conditions, including pregnancy." },
  { icon: "♧", title: "Family and Child Health Care", text: "Care focused on family and child health, including preventive care, immunisations and wellness check-ups." },
  { icon: "⚕", title: "Medical and Surgical Services", text: "Medical and surgical services, from routine procedures to complex surgeries." },
  { icon: "＋", title: "Emergency Care Services", text: "Emergency care for patients who need immediate medical attention and rapid response." },
  { icon: "◈", title: "Specialist Consultation Services", text: "Specialist consultations including gynaecology, endocrinology, paediatrics, orthopaedics, urology and others." },
  { icon: "♡", title: "Artificial Reproductive Technique (ART)", text: "Advanced ART procedures, including IVF, ICSI, IUI and fertility preservation care." },
];

const portals = [
  { name: "Admin Portal", desc: "Hospital administration and operational oversight", role: "admin" },
  { name: "Reception Portal", desc: "Patient registration, appointments and front desk", role: "receptionist" },
  { name: "Staff Portal", desc: "Shared workspace for authorised clinical staff", role: "staff" },
  { name: "Patient Portal", desc: "Appointments and authorised patient information", role: "patient" },
];

export default function Home() {
  return (
    <main className="public-hms coxwell-home">
      <div className="coxwell-topline"><span>COXWELL SPECIALIST HOSPITAL</span><span>PASSION TO CARE, SKILL TO HEAL</span></div>
      <header className="public-hms-header coxwell-header">
        <Link href="/" className="public-hms-brand coxwell-brand">
          <span>✚</span><b>{hospital.name}</b><small>ABEOKUTA · OGUN STATE</small>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#about">About us</a><a href="#services">Our services</a><a href="#contact">Contact</a>
        </nav>
        <div className="public-hms-actions">
          <ThemeToggle />
          <details className="coxwell-portal-menu">
            <summary>Portal access <span>⌄</span></summary>
            <div className="coxwell-portal-dropdown">
              <div className="coxwell-menu-heading">SELECT YOUR PORTAL</div>
              {portals.map((portal) => (
                <Link key={portal.role} href={`/login?portal=${portal.role}`}>
                  <span className="coxwell-menu-icon">✚</span>
                  <span><b>{portal.name}</b><small>{portal.desc}</small></span>
                  <i>↗</i>
                </Link>
              ))}
            </div>
          </details>
        </div>
      </header>

      <section className="coxwell-hero">
        <div className="coxwell-hero-copy">
          <span className="public-hms-kicker"><i /> YOUR HEALTH, OUR PRIORITY</span>
          <h1>Your Health,<br /><em>Our Priority.</em></h1>
          <p className="coxwell-hero-lead">We are committed to the highest standards of affordable healthcare for every community.</p>
          <div className="coxwell-hero-actions">
            <a className="coxwell-primary" href="https://coxwellhospital.com/appointment/">Request an appointment <span>↗</span></a>
            <a className="coxwell-secondary" href="tel:+2348102599983">Call the hospital <span>+234 810 259 9983</span></a>
          </div>
          <div className="coxwell-hero-proof"><span>✚ Patient-centred care</span><span>◈ Specialist services</span><span>♡ Family health</span><span>24/7 help line</span></div>
        </div>
        <div className="coxwell-hero-visual" aria-label="Coxwell Specialist Hospital">
          <img className="coxwell-building-photo" src="https://coxwellhospital.com/_nuxt/hospital-building-view.CuHOeUg9.webp" alt="Coxwell Specialist Hospital building" />
          <div className="coxwell-photo-shade" />
          <div className="coxwell-visual-card"><small>COXWELL SPECIALIST HOSPITAL</small><b>Passion to care.<br />Skill to heal.</b><span>Professional · Compassionate · Affordable</span></div>
          <div className="coxwell-visual-note"><span>✓</span><div><b>Care for every family</b><small>Personalised healthcare support</small></div></div>
        </div>
      </section>

      <section className="coxwell-highlight-strip">
        <div><b>01</b><span>Professional<br />healthcare delivery</span></div>
        <div><b>02</b><span>Compassionate<br />patient support</span></div>
        <div><b>03</b><span>Modern healthcare<br />approach</span></div>
        <div><b>04</b><span>Specialist<br />consultations</span></div>
      </section>

      <section className="public-hms-section coxwell-about" id="about">
        <div className="coxwell-section-intro">
          <span className="public-hms-kicker">ABOUT COXWELL</span>
          <h2>Medical Professionals<br /><em>dedicated to your well-being.</em></h2>
          <p>At Coxwell Specialist Hospital, our team of highly skilled professionals deliver the highest standard of affordable and personalised medical services for you and your family, ensuring that everyone has access to quality care.</p>
          <a href="https://coxwellhospital.com/about/" target="_blank" rel="noreferrer" className="coxwell-inline-link">Read more about the hospital ↗</a>
        </div>
        <div className="coxwell-about-panels">
          <article><span>OUR MISSION</span><p>To provide the highest standard of affordable healthcare with professional and compassionate delivery.</p></article>
          <article><span>OUR VISION</span><p>Progressive healthcare beneficial to all, with continuous contribution to medical knowledge and teaching.</p></article>
          <article><span>OUR VALUES</span><p>Integrity, honesty and compassionate care guide the way we serve patients and families.</p></article>
        </div>
      </section>

      <section className="public-hms-section coxwell-services" id="services">
        <div className="coxwell-services-head">
          <div><span className="public-hms-kicker">OUR MEDICAL SERVICES</span><h2>Comprehensive Services<br /><em>for your well-being.</em></h2></div>
          <p>Discover a wide range of medical services, from routine check-ups to specialised treatment. Contact the hospital to confirm clinic schedules and service availability.</p>
        </div>
        <div className="coxwell-service-grid">
          {services.map((service, index) => <article key={service.title}><span className="coxwell-service-icon">{service.icon}</span><small>0{index + 1}</small><h3>{service.title}</h3><p>{service.text}</p></article>)}
        </div>
      </section>

      <section className="coxwell-trust-section">
        <div><span className="public-hms-kicker">WHY CHOOSE COXWELL</span><h2>Care you can trust.<br /><em>Expertise you can rely on.</em></h2></div>
        <div className="coxwell-trust-grid">
          <article><b>Patient-Centered Care</b><p>Care that prioritises the needs and wellbeing of every patient.</p></article>
          <article><b>Cutting-Edge Medical Technology</b><p>Modern tools and digital technology to enhance the patient experience.</p></article>
          <article><b>Experienced Healthcare Team</b><p>Medical professionals and expert consultants across specialist services.</p></article>
          <article><b>HMO Support</b><p>Hospital support for patients using health insurance firms.</p></article>
        </div>
      </section>

      <section className="coxwell-appointment">
        <div><span className="public-hms-kicker">WE ARE HERE FOR YOU</span><h2>Let us help you take<br /><em>the next step.</em></h2><p>For appointments, service enquiries and patient support, contact the hospital directly through the details below.</p></div>
        <div className="coxwell-appointment-actions"><a href="https://coxwellhospital.com/appointment/">Request an appointment ↗</a><a href="tel:+2348102599983">Call +234 810 259 9983</a></div>
      </section>

      <section className="public-hms-section coxwell-contact" id="contact">
        <div><span className="public-hms-kicker">CONTACT & LOCATION</span><h2>We are ready<br /><em>to hear from you.</em></h2><p>Reach the hospital for enquiries, appointments and directions.</p><a className="coxwell-map-link" href="https://www.google.com/maps/search/?api=1&query=1+Omolaja+Badmos+Street+Leme+Abeokuta" target="_blank" rel="noreferrer">Get directions ↗</a></div>
        <div className="coxwell-contact-grid">
          <a href="tel:+2348102599983"><small>GENERAL ENQUIRIES</small><b>+234 810 259 9983</b></a>
          <a href="tel:+2347026529479"><small>IVF FERTILITY CENTRE</small><b>+234 702 652 9479</b></a>
          <a href="mailto:info@coxwellhospital.com"><small>EMAIL</small><b>info@coxwellhospital.com</b></a>
          <div><small>HOSPITAL ADDRESS</small><b>1, Omolaja Badmos Street, Leme, Abeokuta, Ogun State, Nigeria.</b></div>
          <a href="https://coxwellhospital.com/" target="_blank" rel="noreferrer"><small>OFFICIAL WEBSITE</small><b>coxwellhospital.com ↗</b></a>
        </div>
      </section>

      <footer className="public-hms-footer coxwell-footer">
        <Link href="/" className="public-hms-brand coxwell-brand"><span>✚</span><b>{hospital.name}</b><small>PASSION TO CARE, SKILL TO HEAL</small></Link>
        <small>© {new Date().getFullYear()} · Hospital information referenced from publicly available Coxwell channels.</small>
        <a className="samzy-credit-button" href="https://samzytech.name.ng" target="_blank" rel="noreferrer">Built by samzytechnology limited ↗</a>
        <small className="coxwell-prototype-note">Independent Samzy Technology website and HMS concept. Not the official Coxwell Hospital website and not affiliated with or endorsed by the hospital.</small>
      </footer>
    </main>
  );
}
