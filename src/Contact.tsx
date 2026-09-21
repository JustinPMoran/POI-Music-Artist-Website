import { useState, type FormEvent } from 'react';

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
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
        }),
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        const errorData = await res.json().catch(() => null);
        if (errorData?.error) {
          console.error('Contact API Error:', errorData.error);
        }
        setStatus('error');
      }
    } catch (err) {
      console.error('Contact Form Network Error:', err);
      setStatus('error');
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
            <div className="contact-status-card is-success" role="status">
              <div className="contact-status-header">
                <svg
                  className="contact-status-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="contact-status-title">MESSAGE SENT</span>
              </div>
              <div className="contact-status-body">
                <p className="contact-status-text">
                  Thank you for reaching out! We will get back to you shortly.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="contact-status-card is-error" role="alert">
              <div className="contact-status-header">
                <svg
                  className="contact-status-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="contact-status-title">UNABLE TO SEND MESSAGE</span>
              </div>
              <div className="contact-status-body">
                <p className="contact-status-text">
                  Unable to send your message right now. Please try again later or email{' '}
                  <a
                    href="mailto:pvmclasen@gmail.com"
                    className="contact-status-link contact-status-link-highlight"
                  >
                    pvmclasen@gmail.com
                  </a>{' '}
                  directly.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
