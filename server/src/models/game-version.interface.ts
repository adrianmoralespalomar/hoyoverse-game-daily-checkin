export interface GameVersion {
  name: string;
  startsAt: string;
  endsAt: string;
  /** El calendario solo enseñaba media versión y este extremo se ha calculado (las versiones duran 6 semanas). */
  estimatedEdge: 'start' | 'end' | null;
}
