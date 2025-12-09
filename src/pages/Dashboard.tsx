import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Receipt, UserCheck, FlaskConical, Pill, TrendingUp, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dashboardApi, appointmentsApi, patientsApi } from '@/lib/api';
import { Appointment, Patient, DashboardStats } from '@/types/hospital';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingBills: 0,
    availableDoctors: 0,
    pendingLabTests: 0,
    lowStockMedicines: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, appointmentsRes, patientsRes] = await Promise.all([
        dashboardApi.getStats(),
        appointmentsApi.getAll(),
        patientsApi.getAll(),
      ]);

      setStats(statsData);
      setRecentAppointments(appointmentsRes.data?.slice(0, 4) || []);
      setRecentPatients(patientsRes.data?.slice(0, 4) || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients.toLocaleString()}
            icon={Users}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={Calendar}
            variant="info"
          />
          <StatCard
            title="Pending Bills"
            value={stats.pendingBills}
            icon={Receipt}
            variant="warning"
          />
          <StatCard
            title="Available Doctors"
            value={stats.availableDoctors}
            icon={UserCheck}
            variant="success"
          />
          <StatCard
            title="Pending Lab Tests"
            value={stats.pendingLabTests}
            icon={FlaskConical}
            variant="info"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockMedicines}
            icon={Pill}
            variant="warning"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Appointments */}
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Appointments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recentAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {apt.time}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{apt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{apt.doctorName}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          apt.status === 'Scheduled'
                            ? 'default'
                            : apt.status === 'Completed'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recentPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No patients registered yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-sm font-bold text-success">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.gender}, {patient.age} yrs
                          </p>
                        </div>
                      </div>
                      <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>
                        {patient.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
