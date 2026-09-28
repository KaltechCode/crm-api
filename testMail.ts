const msg = {
 to: 'tkakmo@gmail.com',
 from: '',
 subject: 'test',
 text: 'good job',
 html: '<strong>good job</strong>'
}

(async() => {
 try {
  await mail.send(msg);
 } catch (e) {
  console.error(e);
  if(e.response) console.error(e.response.body);
 }
})();
