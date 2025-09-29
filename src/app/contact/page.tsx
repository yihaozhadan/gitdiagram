"use client";

import React, { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"" | "success" | "error">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      const formElement = e.target as HTMLFormElement;
      const formData = new FormData(formElement);
      
      if (!process.env.NEXT_PUBLIC_FORMSUBMIT_KEY) {
        throw new Error('FormSubmit key is not configured');
      }
      
      const response = await fetch(`https://formsubmit.co/${process.env.NEXT_PUBLIC_FORMSUBMIT_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Form submission failed');
      
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 bg-background min-h-screen">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Contact Me</h1>
      <p className="mb-8">
        Have questions or feedback about GitDiagram? I&apos;d love to hear from you!
        Fill out the form below and I&apos;ll get back to you as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 bg-background dark:bg-gray-800 text-foreground"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 bg-background dark:bg-gray-800 text-foreground"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 bg-background dark:bg-gray-800 text-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-purple-600 dark:bg-purple-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700 dark:hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>

        {submitStatus === "success" && (
          <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              Thank you for your message! I&apos;ll get back to you soon.
            </p>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Sorry, there was an error sending your message. Please try again later.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
