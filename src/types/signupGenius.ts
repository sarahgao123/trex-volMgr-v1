export interface SignUpGeniusVolunteer {
  email: string;
  firstName: string;
  lastName: string;
}

export interface SignUpGeniusSlot {
  title: string;
  startDate: string;
  endDate: string;
  volunteers: SignUpGeniusVolunteer[];
}

export interface SignUpGeniusEvent {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  slots: SignUpGeniusSlot[];
}