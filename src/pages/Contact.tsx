import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  return (
    <>
      <PageHeader
        eyebrow="GET IN TOUCH"
        title="We're here to help."
        subtitle="Questions about exam codes, payments, or how to start? Reach out — we usually reply within 24 hours." />
      
      <section className="bg-background py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-6 md:col-span-1">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Email</h3>
                <a
                  href="mailto:support@kora.rw"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  
                  support@kora.rw
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Phone / WhatsApp</h3>
                <p className="text-sm text-muted-foreground">
                  +250 788 123 456
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Office</h3>
                <p className="text-sm text-muted-foreground">
                  KG 9 Ave, Kigali, Rwanda
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {submitted ?
            <div className="bg-secondary border border-primary/30 rounded-2xl p-10 text-center">
                <div className="inline-flex w-14 h-14 rounded-full bg-primary text-primary-foreground items-center justify-center mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">
                  Message sent!
                </h3>
                <p className="text-sm text-muted-foreground">
                  We'll get back to you within 24 hours.
                </p>
              </div> :

            <form
              onSubmit={handleSubmit}
              className="bg-background border border-border rounded-2xl p-6 md:p-8 space-y-5">
              
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-2">
                      Full Name
                    </label>
                    <input
                    required
                    type="text"
                    className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Mugisha Eric" />
                  
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-2">
                      Email
                    </label>
                    <input
                    required
                    type="email"
                    className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="you@example.com" />
                  
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-2">
                    Subject
                  </label>
                  <input
                  required
                  type="text"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Payment issue" />
                
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-2">
                    Message
                  </label>
                  <textarea
                  required
                  rows={5}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  placeholder="How can we help?" />
                
                </div>
                <button
                type="submit"
                className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                
                  Send Message <Send size={14} />
                </button>
              </form>
            }
          </div>
        </div>
      </section>
    </>);

}