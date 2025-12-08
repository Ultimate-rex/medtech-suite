import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Stethoscope, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Ambulance,
  Users,
  Award,
  Shield,
  ArrowRight,
  Play,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useHospitalSettings } from '@/hooks/useHospitalSettings';

const LandingPage = () => {
  const navigate = useNavigate();
  const { settings } = useHospitalSettings();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const services = [
    { icon: Heart, title: 'Cardiology', description: 'Complete heart care with advanced diagnostics' },
    { icon: Stethoscope, title: 'General Medicine', description: 'Comprehensive health checkups and treatments' },
    { icon: Users, title: 'Pediatrics', description: 'Specialized care for infants and children' },
    { icon: Shield, title: 'Emergency Care', description: '24/7 emergency services with rapid response' },
  ];

  const stats = [
    { value: '10,000+', label: 'Happy Patients' },
    { value: '50+', label: 'Expert Doctors' },
    { value: '24/7', label: 'Emergency Care' },
    { value: '15+', label: 'Years Experience' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Hospital Logo" className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
            )}
            <span className="text-xl font-bold text-foreground">
              {settings?.hospital_name || 'Hospital Management System'}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button onClick={() => navigate('/patient-dashboard')}>
                My Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/patient-auth')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/patient-auth?mode=signup')}>
                  Sign Up
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-muted-foreground">
              Staff Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="text-sm">
                <Award className="mr-2 h-4 w-4" />
                Trusted by 10,000+ patients
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                Your Health, Our{' '}
                <span className="text-primary">Priority</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Experience world-class healthcare with our team of experienced doctors, 
                modern facilities, and compassionate care. Book your appointment today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate(isLoggedIn ? '/patient-dashboard' : '/patient-auth')}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Button>
                <Button size="lg" variant="outline">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Emergency
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/30 p-8">
                <div className="absolute inset-4 rounded-2xl bg-card shadow-2xl overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 p-6 h-full">
                    <div className="space-y-4">
                      <div className="aspect-video rounded-xl bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-12 w-12 text-primary" />
                      </div>
                      <div className="aspect-square rounded-xl bg-secondary/50 flex items-center justify-center">
                        <Heart className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="aspect-square rounded-xl bg-secondary/50 flex items-center justify-center">
                        <Users className="h-10 w-10 text-primary" />
                      </div>
                      <div className="aspect-video rounded-xl bg-primary/10 flex items-center justify-center">
                        <Ambulance className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold">{stat.value}</div>
                <div className="text-primary-foreground/80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer comprehensive healthcare services with state-of-the-art facilities 
              and experienced medical professionals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Why Choose Us?</h2>
              <p className="text-muted-foreground">
                With over 15 years of experience in healthcare, we have established ourselves 
                as a trusted name in medical care. Our commitment to excellence and patient 
                satisfaction sets us apart.
              </p>
              <ul className="space-y-4">
                {[
                  'Experienced and certified medical professionals',
                  'Modern diagnostic equipment and facilities',
                  '24/7 emergency care services',
                  'Affordable treatment packages',
                  'Patient-centric approach to healthcare'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <Shield className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold">Safe & Secure</h3>
                <p className="text-sm text-muted-foreground mt-2">Your health data is protected</p>
              </Card>
              <Card className="p-6 text-center">
                <Award className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold">Certified Doctors</h3>
                <p className="text-sm text-muted-foreground mt-2">Top medical professionals</p>
              </Card>
              <Card className="p-6 text-center">
                <Clock className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-sm text-muted-foreground mt-2">Round the clock care</p>
              </Card>
              <Card className="p-6 text-center">
                <Heart className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold">Patient Care</h3>
                <p className="text-sm text-muted-foreground mt-2">Compassionate treatment</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              Have questions? We're here to help. Reach out to us through any of these channels.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center p-6">
              <Phone className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Emergency</h3>
              <p className="text-muted-foreground">+91-1800-HOSPITAL</p>
              <p className="text-sm text-muted-foreground mt-1">24/7 Available</p>
            </Card>
            <Card className="text-center p-6">
              <Mail className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground">info@hospital.com</p>
              <p className="text-sm text-muted-foreground mt-1">Quick response within 24hrs</p>
            </Card>
            <Card className="text-center p-6">
              <MapPin className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Address</h3>
              <p className="text-muted-foreground">123 Healthcare Avenue</p>
              <p className="text-sm text-muted-foreground mt-1">Mumbai, India</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Appointment?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied patients who trust us with their healthcare needs.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate(isLoggedIn ? '/patient-dashboard' : '/patient-auth')}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Book Appointment Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold">{settings?.hospital_name || 'Hospital Management System'}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 All rights reserved. Designed for better healthcare.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
