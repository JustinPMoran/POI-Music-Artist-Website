import { useState, type FormEvent } from 'react';

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const fallbackMailto = () => {
      const subject = encodeURIComponent(`POI Project Inquiry: ${data.subject || 'Project Proposal'}`);
      const body = encodeURIComponent(
        `Name: ${data.name || ''}\nEmail: ${data.email || ''}\n\nMessage:\n${data.message || ''}`
      );
      window.location.href = `mailto:pvmclasen@gmail.com?subject=${subject}&body=${body}`;
      setStatus('success');
    };

    try {
      const res = await fetch('https://formsubmit.co/ajax/pvmclasen@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          _subject: `POI Inquiry from ${data.name}: ${data.subject || 'New Message'}`,
          _template: 'box',
        }),
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        fallbackMailto();
      }
    } catch {
      fallbackMailto();
    }
  };

  return (
    <section className="contact-section" id="contact" aria-label="Contact Me">
      <div className="contact-container">
        <div className="contact-header">
          <div className="contact-title-row">
            <span className="contact-line" aria-hidden="true" />
            <h2 className="contact-title">CONTACT ME</h2>
            <span className="contact-line" aria-hidden="true" />
          </div>
          <p className="contact-subtitle">
            Any project proposals or inquiries can be sent this way!
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-row">
            <div className="contact-field">
              <label className="contact-label" htmlFor="contact-name">
                NAME
              </label>
              <input
                className="contact-input"
                id="contact-name"
                name="name"
                type="text"
                required
                placeholder="Your name"
              />
            </div>

            <div className="contact-field">
              <label className="contact-label" htmlFor="contact-email">
                EMAIL
              </label>
              <input
                className="contact-input"
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className="contact-field">
            <label className="contact-label" htmlFor="contact-subject">
              SUBJECT
            </label>
            <input
              className="contact-input"
              id="contact-subject"
              name="subject"
              type="text"
              required
              placeholder="Project proposal, collaboration, booking..."
            />
          </div>

          <div className="contact-field">
            <label className="contact-label" htmlFor="contact-message">
              MESSAGE
            </label>
            <textarea
              className="contact-textarea"
              id="contact-message"
              name="message"
              rows={4}
              required
              placeholder="Describe your project or inquiry..."
            />
          </div>

          <button
            type="submit"
            className="contact-submit-btn"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'SENDING...' : 'SEND MESSAGE'}
          </button>

          {status === 'success' && (
            <p className="contact-status-msg is-success" role="status">
              ✓ Message sent! We will get back to you shortly.
            </p>
          )}

          {status === 'error' && (
            <p className="contact-status-msg is-error" role="alert">
              Unable to send message. Please try again.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
