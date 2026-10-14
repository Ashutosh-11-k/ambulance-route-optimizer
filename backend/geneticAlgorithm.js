function createPopulation(routes) {
  const population = routes.map((route) => {
    return {
      ambulance: route.ambulance,
      patient: route.patient,
      hospital: route.hospital,
      ambulanceNumber: route.ambulanceNumber,
      hospitalName: route.hospitalName,
      emergencyPriority: route.emergencyPriority,

      ambulanceToPatient: route.route.ambulanceToPatient,
      patientToHospital: route.route.patientToHospital,

      distance: route.route.totalDistance,
    };
  });

  return population;
}

function calculateFitness(population, shortestDistance) {
  if (population.length === 0) {
    return [];
  }

  if (shortestDistance === undefined) {
    shortestDistance = Math.min(
      ...population.map((individual) => individual.distance),
    );
  }

  return population.map((individual) => {
    const priorityScore = individual.emergencyPriority / 5;
    const distanceScore = shortestDistance / individual.distance;
    const fitness = 0.6 * priorityScore + 0.4 * distanceScore;

    return {
      ...individual,
      fitness: Number(fitness.toFixed(4)),
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

  for (let i = 0; i < selectedIndividuals.length; i += 2) {
    const parent1 = selectedIndividuals[i];

    const parent2 = selectedIndividuals[(i + 1) % selectedIndividuals.length];

    const childAmbulance = parent1.ambulance;
    const childHospital = parent2.hospital;

    const matchingRoute = routes.find((route) => {
      return (
        route.ambulance.toString() === childAmbulance.toString() &&
        route.hospital.toString() === childHospital.toString()
      );
    });

    if (!matchingRoute) {
      continue;
    }

    const child = {
      ambulance: childAmbulance,
      patient: parent1.patient,
      hospital: childHospital,
      ambulanceNumber: parent1.ambulanceNumber,
      hospitalName: parent2.hospitalName,
      emergencyPriority: matchingRoute.emergencyPriority,

      ambulanceToPatient: matchingRoute.route.ambulanceToPatient,
      patientToHospital: matchingRoute.route.patientToHospital,

      distance: matchingRoute.route.totalDistance,
    };

    children.push(child);

    if (children.length < selectedIndividuals.length) {
      const secondChild = {
        ambulance: parent2.ambulance,
        patient: parent2.patient,
        hospital: parent1.hospital,
        ambulanceNumber: parent2.ambulanceNumber,
        hospitalName: parent1.hospitalName,
        emergencyPriority: parent2.emergencyPriority,
      };

      const secondMatchingRoute = routes.find((route) => {
        return (
          route.ambulance.toString() === secondChild.ambulance.toString() &&
          route.hospital.toString() === secondChild.hospital.toString()
        );
      });

      if (secondMatchingRoute) {
        secondChild.ambulanceToPatient =
          secondMatchingRoute.route.ambulanceToPatient;

        secondChild.patientToHospital =
          secondMatchingRoute.route.patientToHospital;

        secondChild.distance = secondMatchingRoute.route.totalDistance;

        secondChild.emergencyPriority = secondMatchingRoute.emergencyPriority;

        children.push(secondChild);
      }
    }
  }

  return children;
}

function mutation(children, routes) {
  const mutatedChildren = [];

  for (let i = 0; i < children.length; i++) {
    const child = { ...children[i] };

    const mutationRate = 0.5;
    const randomValue = Math.random();

    if (randomValue < mutationRate && routes.length > 0) {
      const randomRouteIndex = Math.floor(Math.random() * routes.length);

      const mutationRoute = routes[randomRouteIndex];

      child.ambulance = mutationRoute.ambulance;
      child.patient = mutationRoute.patient;
      child.hospital = mutationRoute.hospital;
      child.ambulanceNumber = mutationRoute.ambulanceNumber;
      child.hospitalName = mutationRoute.hospitalName;
      child.emergencyPriority = mutationRoute.emergencyPriority;

      child.ambulanceToPatient = mutationRoute.route.ambulanceToPatient;

      child.patientToHospital = mutationRoute.route.patientToHospital;

      child.distance = mutationRoute.route.totalDistance;
    }

    mutatedChildren.push(child);
  }

  return mutatedChildren;
}

function runGenerations(routes, numberOfGenerations) {
  let population = createPopulation(routes);
  const shortestDistance = Math.min(
    ...population.map((individual) => individual.distance),
  );

  const generations = [];

  let bestRoute = null;

  for (let generation = 1; generation <= numberOfGenerations; generation++) {
    const populationWithFitness = calculateFitness(
      population,
      shortestDistance,
    );
    if (populationWithFitness.length === 0) {
      break;
    }

    const selectedIndividuals = selection(populationWithFitness);

    const children = crossover(selectedIndividuals, routes);

    const mutatedChildren = mutation(children, routes);

    const evaluatedChildren = calculateFitness(
      mutatedChildren,
      shortestDistance,
    );
    if (evaluatedChildren.length === 0) {
      break;
    }

    // Keep the best individual from the current population
    const currentBestRoute = populationWithFitness.reduce((best, current) => {
      return current.fitness > best.fitness ? current : best;
    });

    // Create the next population using the evaluated children
    const nextPopulation = [...evaluatedChildren];

    // Find the index of the child with the lowest fitness
    const worstChildIndex = nextPopulation.reduce(
      (worstIndex, current, index, array) => {
        return current.fitness < array[worstIndex].fitness ? index : worstIndex;
      },
      0,
    );

    // Preserve the best current route if it is better than the worst child
    if (currentBestRoute.fitness > nextPopulation[worstChildIndex].fitness) {
      nextPopulation[worstChildIndex] = currentBestRoute;
    }

    const generationBestRoute = nextPopulation.reduce((best, current) => {
      if (best === null || current.fitness > best.fitness) {
        return current;
      }

      return best;
    }, null);

    if (bestRoute === null || generationBestRoute.fitness > bestRoute.fitness) {
      bestRoute = generationBestRoute;
    }

    population = nextPopulation;

    generations.push({
      generation: generation,
      population: populationWithFitness,
      selectedIndividuals: selectedIndividuals,
      children: children,
      mutatedChildren: evaluatedChildren,
      generationBestRoute: generationBestRoute,
    });
  }

  return {
    generations: generations,
    bestRoute: bestRoute,
  };
}

module.exports = {
  createPopulation,
  calculateFitness,
  selection,
  crossover,
  mutation,
  runGenerations,
};
