import { Mail, MessageSquareText, Phone, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import PatientFooter from "@/components/patient-footer";
import PatientNavbar from "@/components/patient-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sendContactUsRequest } from "@/services/notifications";

const navItems = [
  { label: "Find Doctors", to: "/doctors" },
  { label: "Clinics", to: "/join-with-us" },
  { label: "Join With Us", to: "/join-with-us" },
  { label: "Contact Us", to: "/contact-us" },
];

const initialState = {
  email: "",
  phone: "",
  message: "",
};

export default function ContactUsPage() {
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.phone || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      await sendContactUsRequest({
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });

      toast.success("Your message has been sent successfully.");
      setForm(initialState);
    } catch (error) {
      toast.error("Unable to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PatientNavbar links={navItems} showSignIn showRegister />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="border border-slate-200 bg-white py-6 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl tracking-tight text-slate-900">Contact Us</CardTitle>
            <p className="text-sm text-slate-600">
              Send us your message and our team will contact you as soon as possible.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Mail className="size-4 text-teal-700" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Phone className="size-4 text-teal-700" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                    placeholder="+94 77 123 4567"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <MessageSquareText className="size-4 text-teal-700" />
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  placeholder="Write your message here..."
                  className="min-h-36 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 text-white hover:bg-teal-800"
                  disabled={isSubmitting}
                >
                  <Send className="size-4" />
                  {isSubmitting ? "Sending..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <PatientFooter />
    </div>
  );
}
