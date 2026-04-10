import { Button } from "@/components/ui/button";
import { Calendar, Clock, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">BookSlate</span>
          </div>
          <nav className="ml-auto flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/book">
              <Button>Book Appointment</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Professional Appointment
              <span className="text-blue-600"> Booking</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Seamlessly schedule appointments with integrated calendar management.
              Perfect for professionals who value efficiency and organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link href="/book">
                <Button size="lg" className="text-lg px-8">
                  <Clock className="mr-2 h-5 w-5" />
                  Book Now
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
            <p className="text-slate-600 mt-4">Everything you need for appointment management</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Calendar Integration</h3>
              <p className="text-slate-600">
                Automatic synchronization with Google Calendar for seamless scheduling
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Real-time Availability</h3>
              <p className="text-slate-600">
                See available time slots instantly and avoid double bookings
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">User Management</h3>
              <p className="text-slate-600">
                Comprehensive admin panel for managing appointments and users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">BookSlate</span>
            </div>
            <p className="text-sm text-slate-600 mt-4 md:mt-0">
              © 2024 BookSlate. Professional appointment booking system.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
