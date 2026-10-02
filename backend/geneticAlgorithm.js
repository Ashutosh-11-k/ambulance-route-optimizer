function createPopulation(routes) {
  const population = routes.map((route) => {
    return {
      ambulance: route.ambulance,
      patient: route.patient,
      hospital: route.hospital,
      ambulanceNumber: route.ambulanceNumber,
      hospitalName: route.hospitalName,
      distance: route.route.totalDistance,
    };
  });
  return population;
}

function calculateFitness(population) {
  return population.map((individual) => {
    return {
      ...individual,
      fitness: Number((1 / individual.distance).toFixed(4)),
    };
  });
}

function selection(population) {
  const selected = [];

  for (let i = 0; i < population.length; i++) {
    const randomIndex1 = Math.floor(Math.random() * population.length);
    const randomIndex2 = Math.floor(Math.random() * population.length);

    const individual1 = population[randomIndex1];
    const individual2 = population[randomIndex2];

    if (individual1.fitness >= individual2.fitness) {
      selected.push(individual1);
    } else {
      selected.push(individual2);
    }
  }

  return selected;
}

function crossover(selectedIndividuals, routes) {
  const children = [];

  for (let i = 0; i < selectedIndividuals.length - 1; i += 2) {
    const parent1 = selectedIndividuals[i];
    const parent2 = selectedIndividuals[i + 1];

    const childAmbulance = parent1.ambulance;
    const childHospital = parent2.hospital;

    const matchingRoute = routes.find((route) => {
      return (
        route.ambulance.toString() === childAmbulance.toString() &&
        route.hospital.toString() === childHospital.toString()
      );
    });

    const child = {
      ambulance: childAmbulance,
      patient: parent1.patient,
      hospital: childHospital,
      ambulanceNumber: parent1.ambulanceNumber,
      hospitalName: parent2.hospitalName,
      distance: matchingRoute.route.totalDistance,
      fitness: Number((1 / matchingRoute.route.totalDistance).toFixed(4)),
    };

    children.push(child);
  }

  return children;
}

function mutation(children, routes) {
  const mutatedChildren = [];

  for (let i = 0; i < children.length; i++) {
    const child = { ...children[i] };

    const mutationRate = 0.5;
    const randomValue = Math.random();

    if (randomValue < mutationRate) {
      const randomRouteIndex = Math.floor(Math.random() * routes.length);

      const mutationRoute = routes[randomRouteIndex];

      child.ambulance = mutationRoute.ambulance;
      child.hospital = mutationRoute.hospital;
      child.ambulanceNumber = mutationRoute.ambulanceNumber;
      child.hospitalName = mutationRoute.hospitalName;
      child.distance = mutationRoute.route.totalDistance;
      child.fitness = Number(
        (1 / mutationRoute.route.totalDistance).toFixed(4),
      );
    }

    mutatedChildren.push(child);
  }

  return mutatedChildren;
}

module.exports = {
  createPopulation,
  calculateFitness,
  selection,
  crossover,
  mutation,
};
