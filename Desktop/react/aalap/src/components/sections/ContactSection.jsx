import { useState } from 'react';

export default function ContactSection() {
  const [contactMessage, setContactMessage] = useState('');

  const handleContactSubmit = (event) => {
    event.preventDefault();
    setContactMessage('Thank you for reaching out. This demo form is frontend-only, so your message has not been sent.');
    event.currentTarget.reset();
  };

  return (
    <section id="contact" className="scroll-mt-20 bg-[#f7f5ef] px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a88b53]">We would love to hear from you</p>
          <h2 className="font-serif text-4xl leading-tight tracking-[-0.025em] text-[#292821] sm:text-5xl">Get in Touch</h2>
          <p className="mt-5 max-w-[420px] text-sm leading-7 text-[#77746c]">Have a question or need a little more information? Send us a note and we will be glad to help.</p>
          <div className="mt-9 space-y-4 text-sm text-[#615e55]">
            <p><span className="mr-3 text-[#a88b53]">✦</span>Address: Add your hotel address</p>
            <p><span className="mr-3 text-[#a88b53]">✦</span>Phone: Add your contact number</p>
            <p><span className="mr-3 text-[#a88b53]">✦</span>Email: Add your contact email</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr]">
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <label className="sr-only" htmlFor="contact-name">Your name</label>
            <input id="contact-name" name="name" required placeholder="Your name" className="w-full border border-[#e5e0d5] bg-white px-4 py-4 text-sm text-[#292821] outline-none transition focus:border-[#a88b53]" />
            <label className="sr-only" htmlFor="contact-email">Email address</label>
            <input id="contact-email" name="email" type="email" required placeholder="Email address" className="w-full border border-[#e5e0d5] bg-white px-4 py-4 text-sm text-[#292821] outline-none transition focus:border-[#a88b53]" />
            <label className="sr-only" htmlFor="contact-message">Your message</label>
            <textarea id="contact-message" name="message" required rows="5" placeholder="Your message" className="w-full resize-y border border-[#e5e0d5] bg-white px-4 py-4 text-sm text-[#292821] outline-none transition focus:border-[#a88b53]" />
            <button type="submit" className="bg-[#292821] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53]">Contact Us</button>
            {contactMessage && <p role="status" className="text-sm leading-6 text-[#66583b]">{contactMessage}</p>}
          </form>
          <div className="flex min-h-[270px] flex-col items-center justify-center border border-dashed border-[#cfc7b5] bg-[#f0ede4] p-6 text-center">
            <span className="mb-3 text-2xl text-[#a88b53]" aria-hidden="true">⌖</span>
            <p className="font-serif text-xl text-[#4c493f]">Location map</p>
            <p className="mt-2 max-w-[220px] text-xs leading-5 text-[#858074]">Map embed reserved for your verified hotel location.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
