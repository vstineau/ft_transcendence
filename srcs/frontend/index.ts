fetch('http://backend:8080/api/message')
  .then(response => response.text())
  .then(data => {
    console.log('backend :', data);
  })
  .catch(err => {
    console.error('Erreur lors de la requête vers le backend :', err);
  });
