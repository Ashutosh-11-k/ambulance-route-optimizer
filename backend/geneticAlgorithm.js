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

module.exports = {
  createPopulation,
};
