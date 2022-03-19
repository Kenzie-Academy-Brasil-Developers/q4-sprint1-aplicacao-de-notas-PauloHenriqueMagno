import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3000;

app.use(express.json());

const USERS = [];

// MIDDLEWARES //

const getUser = (req, res, next) => {
  const { cpf } = req.params;

  const userIndex = USERS.findIndex(randomUser => randomUser.cpf === cpf);

  if(userIndex === -1){
    return res.status(404).send({ error: "user not found"})
  }

  res.user = USERS[userIndex]

  return next()
}

const checkNewCPF = (req, res, next) => {
  const { cpf } = req.body;

  const isInUse = USERS.some( randomUser => randomUser.cpf === cpf )

  if(isInUse){
    return res.status(422).send({ error: "user already exists" });
  };

  return next()
};

const checkNoteUuid = (req, res, next) => {
  const { noteUuid } = req.params;

  const noteIndex = res.user.notes.findIndex(randomNote => randomNote.id === noteUuid);

  if(noteIndex === -1){
    return res.status(404).send({ error: "note is not registered" })
  }

  res.note = res.user.notes[noteIndex];

  return next();
};

// MIDDLEWARES //


// ROUTES //

app.get('/users', (_, res) => res.status(200).send(USERS));

app.post('/users', checkNewCPF, (req, res) => {
  const newUser = {
    id: uuidv4(),
    name: req.body.name,
    cpf: req.body.cpf,
    notes: []
  }

  USERS.push(newUser)

  res.status(201).send(newUser)
});

app.patch('/users/:cpf', getUser, checkNewCPF, (req, res) => {
  const { cpf } = req.params;
  const userIndex = USERS.findIndex( randomUser => randomUser.cpf === cpf);

  USERS[userIndex].name = req.body.name || res.user.name;
  USERS[userIndex].cpf = req.body.cpf || res.user.cpf;

  const userUpdated = USERS[userIndex];

  return res.status(200).send({
    message: 'User is updated',
    user: userUpdated
  });
});

app.delete('/users/:cpf', getUser, (_, res) => {
  USERS.pop(res.user);

  return res.status(204).send("");
});

app.get('/users/:cpf/notes', getUser, (_, res) => res.status(200).send(res.user.notes));
app.delete('users/:cpf/notes/:noteUuid', getUser, checkNoteUuid, (req,res) => {
  const userIndex = USERS.findIndex( randomUser => randomUser === res.user);

  USERS[userIndex].notes.pop(res.note);

  return res.status(204).send()
});

app.post('/users/:cpf/notes', getUser, (req, res) => {
  const userIndex = USERS.findIndex( randomUser => randomUser === res.user);

  const newNote = {
    id: uuidv4(),
    title: req.body.title,
    content: req.body.content,
    create_at: new Date()
  };

  USERS[userIndex].notes.push(newNote);

  return res.status(201).send({
    "message": `${newNote.title} was added into ${res.user.name}'s notes`
  })
});

app.patch('/users/:cpf/notes/:noteUuid', getUser, checkNoteUuid, (req, res) => {
  const { noteUuid } = req.params;
  const { user, note } = res;

  const userIndex = USERS.findIndex( randomUser => randomUser === user );
  const noteIndex = USERS[userIndex].notes.findIndex( randomNote => randomNote.id === noteUuid );

  const newNoteData = {
    id: res.note.id,
    create_at: note.create_at,
    title: req.body.title || note.title,
    content: req.body.content || note.content,
    update_at: new Date()
  };

  USERS[userIndex].notes[noteIndex] = newNoteData

  const noteUpdated = USERS[userIndex].notes[noteIndex];

  return res.status(200).send(noteUpdated);
})

// ROUTES //




app.listen(PORT, () => {
  console.log(`App is runnining on port ${PORT}`);
});