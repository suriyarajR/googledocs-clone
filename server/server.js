const mongoose = require("mongoose");
const Document =require("./Documents")

mongoose.connect("mongodb://localhost/GoogleDocs_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultvalue=""

io.on("connection", (socket) => {
  socket.on("get-document",async (documentId) => {
    const document = await findCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document",document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-document",async data =>{
        await Document.findByIdAndUpdate(documentId,{data})
    })
  });
});

async function findCreateDocument(id){
    if(id==null) return

    const document= await Document.findById(id)
    if (document) return document
    return await Document.create({_id: id, data: defaultvalue})
}