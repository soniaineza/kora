import React from 'react';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { TrafficLaws } from '../components/TrafficLaws';
import { Quiz } from '../components/Quiz';

export function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <TrafficLaws />
      <Quiz />
    </>);

}