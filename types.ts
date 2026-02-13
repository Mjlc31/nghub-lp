import React from 'react';

export interface Lead {
  full_name: string;
  whatsapp: string;
  instagram: string;
  niche: string;
  revenue_range: string;
  biggest_challenge: string;
  status?: string;
  created_at?: string;
}

export interface PillarProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface StatProps {
  value: string;
  label: string;
}