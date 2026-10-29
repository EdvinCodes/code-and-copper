const FLOW_FACTOR = 14.33

export function flowFromPower(powerKw: number, deltaT: number): number | null {
  if (deltaT === 0) return null
  return (FLOW_FACTOR * powerKw) / deltaT
}

export function powerFromFlow(flowLMin: number, deltaT: number): number {
  return (flowLMin * deltaT) / FLOW_FACTOR
}

export function instantCop(thermalKw: number, electricKw: number): number | null {
  if (electricKw <= 0) return null
  return thermalKw / electricKw
}
