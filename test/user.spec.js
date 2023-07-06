const chai = require("chai");
const expect = chai.expect;
const chai_http = require("chai-http");
const server = require("../index");
chai.use(chai_http);
const userModel = require("../models/userModel");
const blogModel = require("../models/blogModel");
const { object } = require("joi");
const { response } = require("express");

let userData = {
  username: "khushi",
  first_name: "khushi",
  last_name: "vijay",
  email: "khus.vijay@gmail.com",
  password: "12345678",
  phone: "7357879612",
  profile: "http://dummyimage.com/193x100.png/cc0000/ffffff",
};

let token;
let user_id;
let id;

describe("------Tasks API---------", () => {
 

  describe("post-api", () => {
    before(async () => {
      await userModel.deleteMany();
    });

    before(async () => {
      await blogModel.deleteMany();
    });
   
    it("api should submit the following data", (done) => {
    
     
      chai
        .request(server)
        .post("/api/user/registration")
        .send(userData)
        .end((error, response) => {
          user_id = response.body.data._id
          expect(response.status).to.be.equal(201);
          expect(response.body.message).to.be.equal(
            "user created successfully"
          );
          expect(response.body.data).to.be.a("object");
          expect(response.body.data).to.not.be.empty;
          expect(response.body.data).to.have.all.keys(
            "_id",
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "phone",
            "profile",
            "role",
            "createdAt",
            "updatedAt",
            "__v"
          );
          done();
        });
    });

    it("api should not submit the data and throw the error 'User already exists go and login'", () => {

      chai
        .request(server)
        .post("/api/user/registration")
        .send(userData)
        .end((error, response) => {
          expect(response.status).to.be.equal(400);
          expect(response.body.message).to.be.equal(
            "User already exists go and login"
          );
        });
    });

    it("user login succesfully", (done) => {
      chai
        .request(server)
        .post("/api/user/userlogin")
        .send({ email: "khus.vijay@gmail.com", password: "12345678" })
        .end((err, response) => {
          token = response.body.accessToken;
          expect(response.status).to.be.equal(200);
          done();
        });
    });

    it("enter invalid email ", (done) => {
      chai
        .request(server)
        .post("/api/user/userlogin")
        .send({ email: "SFDJSFGSDJ@GMAIL.COMN", password: "jdhfjs" })
        .end((err, response) => {
          expect(response.status).to.be.equal(404);
          expect(response.body.error).to.be.equal(
            '"email" must be a valid email'
          );
          done();
        });
    });

    it("enter valid email but not exist in database", (done) => {
      chai
        .request(server)
        .post("/api/user/userlogin")
        .send({ email: "ravindra.dabi@gmail.com", password: "jdhfjs" })
        .end((err, response) => {
          expect(response.status).to.be.equal(404);
          expect(response.body.message).to.be.equal(
            "User not exists...enter correct email or register yourself first"
          );
          done();
        });
    });

    it("enter correct email and incorrect password", (done) => {
      chai
        .request(server)
        .post("/api/user/userlogin")
        .send({ email: "khus.vijay@gmail.com", password: "jdhfjs" })
        .end((err, response) => {
          expect(response.status).to.be.equal(404);
          expect(response.body.message).to.be.equal("Wrong password");
          done();
        });
    });

    it("Get all user api only admin can access", (done) => {
      chai
        .request(server)
        .get("/api/user/getall")
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          expect(response.status).to.be.equal(400);
         expect(response.text).to.be.equal("you are not an admin")
          done();
        });
    }).timeout(100000);

    it("Get user api", (done) => {
      let username = "khushi"
      chai
        .request(server)
        .get("/api/user/" + username)
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          expect(response.status).to.be.equal(200);
         // expect(response.body.message).to.be.equal("new password and confirm password are not equal")
          done();
        });
    }).timeout(100000);

    it("Get user api when username is not send or enter the invalid username", (done) => {
      let username = undefined
      chai
        .request(server)
        .get("/api/user/" + username)
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          expect(response.status).to.be.equal(400);
         expect(response.text).to.be.equal("enter the username or username is not valid")
          done();
        });
    }).timeout(100000);

    it("Update the userdata using username", (done) => {
      let username = "khushi"
      chai
        .request(server)
        .patch("/api/user/" + username)
        .set('Authorization', `Bearer ${token}`)
        .send({phone : "4566544567"})
        .end((err, response) => {
          expect(response.status).to.be.equal(201);
          done();
        });
    }).timeout(100000);


    it("Update the userdata using invalid username", (done) => {
      let username = undefined
      chai
        .request(server)
        .patch("/api/user/" + username)
        .set('Authorization', `Bearer ${token}`)
        .send({phone : "4566544567"})
        .end((err, response) => {
          expect(response.status).to.be.equal(400);
          done();
        });
    }).timeout(100000);


    it("blog post api", (done) => {
      chai
        .request(server)
        .post("/api/blog/create")
        .set('Authorization', `Bearer ${token}`)
        .send({
          "title" : "this is my blog",
          "image" : "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aHVtYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
          "description" : "a standing person",
          "created_by" : user_id
        })
        .end((err, response) => {
          id = response.body.data._id
          expect(response.status).to.be.equal(201);
          done();
        });
    }).timeout(100000);

    it("blog get alll", (done) => {
      chai
        .request(server)
        .get("/api/blog/getall")
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          expect(response.status).to.be.equal(200);
          done();
        });
    }).timeout(100000);


    it("get single blog", (done) => {
      chai
        .request(server)
        .get("/api/blog/get/" + id)
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          expect(response.status).to.be.equal(200);
          done();
        });
    }).timeout(100000);

    it("update the blog", (done) => {
      chai
        .request(server)
        .patch("/api/blog/update/" + id)
        .set('Authorization', `Bearer ${token}`)
        .send({title : "update the title of the blog"})
        .end((err, response) => {
          expect(response.status).to.be.equal(200);
          done();
        });
    }).timeout(100000);


    it("delete the blog", (done) => {
      chai
        .request(server)
        .delete("/api/blog/delete/" + id)
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          expect(response.status).to.be.equal(200);
          done();
        });
    }).timeout(100000);

    it("generate token", (done) => {
      chai
        .request(server)
        .post("/api/user/generatetoken")
        .send({
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0OTNmNWY2NjQ1NWJjMjViZWIzMGZlZCIsImlhdCI6MTY4NzkzNDY2OCwiZXhwIjoxNzE5NDkyMjY4fQ.Dma56rxkCcnmqvKZn5epU6VmnA8XZdTgK6lI22HW0bM",
        })
        .end((err, response) => {
          expect(response.status).to.be.equal(200);
          done();
        });
    });

    it("when user not send the token while generating the token", (done) => {
      chai
        .request(server)
        .post("/api/user/generatetoken")
        .send()
        .end((err, response) => {
          expect(response.status).to.be.equal(400);
          done();
        });
    });

    it("forget password api", (done) => {
      chai
        .request(server)
        .post("/api/user/forgotpass")
        .send({email : "khus.vijay@gmail.com"})
        .end((err, response) => {
          expect(response.status).to.be.equal(200);
          expect(response.body.message).to.be.equal("please check your email")
          done();
        });
    }).timeout(10000);;

    it("forget password api when user not send the email", (done) => {
      chai
        .request(server)
        .post("/api/user/forgotpass")
        .send()
        .end((err, response) => {
          expect(response.status).to.be.equal(400);
          expect(response.body.message).to.be.equal("please enter the email")
          done();
        });
    });

       it("forget password api when user send the email which is not exists in the database", (done) => {
      chai
        .request(server)
        .post("/api/user/forgotpass")
        .send({email : "rav.dabi@gmail.com"})
        .end((err, response) => {
          expect(response.status).to.be.equal(404);
          expect(response.body.message).to.be.equal("user not exists enter the valid email")
          done();
        });
    });

    it("reset password api", (done) => {
      chai
        .request(server)
        .post("/api/user/resetpass")
        .send({email : "khus.vijay@gmail.com", newpassword : "123", confirmpassword : "123"})
        .end((err, response) => {
          expect(response.status).to.be.equal(200);
          expect(response.body.message).to.be.equal("password reset successfully")
          done();
        });
    });

    it("reset password api when user not send the required fields", (done) => {
      chai
        .request(server)
        .post("/api/user/resetpass")
        .send()
        .end((err, response) => {
          expect(response.status).to.be.equal(400);
          expect(response.body.message).to.be.equal("please enter the required fields")
          done();
        });
    });

    it("reset password api when user not send the same newPassword and confirmPassowrd", (done) => {
      chai
        .request(server)
        .post("/api/user/resetpass")
        .send({email : "khus.vijay@gmail.com", newpassword : "123", confirmpassword : "321"})
        .end((err, response) => {
          expect(response.status).to.be.equal(400);
          expect(response.body.message).to.be.equal("new password and confirm password are not equal")
          done();
        });
    });



  });
});

// describe("--------------first test case----------", function () {
//     let name = "ravindra";
//     let data = {
//         name: "john do",
//         email: "khudhi23456@gmail.com",
//         age: 24
//     }
//     it('check-string', function () {
//         expect(name).to.be.a('string');
//     })

//     it('check-value', function () {
//         expect(name).to.equal('ravindra');
//     })

//     it('check-length', function () {
//         expect(name).to.have.lengthOf(8)
//     })

//     it("name, email and age property", function () {
//         expect(data).to.have.property('name');
//         expect(data).to.have.property('email');
//         expect(data).to.have.property('age');

//     })

//     it("name, email and age value not to be empty", function () {
//         expect(data).to.not.be.empty;
//         expect(data).to.not.be.empty;
//         expect(data).to.not.be.empty;

//     })

//     it('check value of name, email and age', function () {
//         expect(data.name).to.equal('john do');
//         expect(data.email).to.equal('khudhi23456@gmail.com');
//         expect(data.age).to.equal(24);
//     })

//     it("check email format", function(){
//         const emailRegex = /^[a-z]+(?:[0-9]+)?@[a-z]+\.[a-z]{2,3}$/;
//         expect(data.email).to.match(emailRegex);
//     })

//     it("check object length", function(){
//         const arrayKeys = Object.keys(data);
//         expect(arrayKeys).to.have.lengthOf(3);
//     })

//     it('check all keys', function(){
//         expect(data).to.have.all.keys("name", 'email', "")
//     })

// })

// let userData = {
//     "username": "khushi",
//     "first_name": "khushi",
//     "last_name": "vijay",
//     "email": "khus.vijay@gmail.com",
//     "password" : "12345678",
//     "phone": "7357879612",
//     "profile": "http://dummyimage.com/193x100.png/cc0000/ffffff"
// }

// describe("my first api test case", () => {
//   let db;
//     before(() => {
//        db = dbConnectiontest();
//       });

//       it()

// it("check already exist data", (done) => {
//   chai.request(server).post('/api/user/registration').send(userData).end((err,res) => {
//       expect(res.status).to.be.equal(400);
//       expect(res._body.message).to.be.equal("User already exists go and login");
//       done()
//   })
// })

// it('post-data', (done) => {
//     chai.request(server).post('/api/user/registration').send(userData).end((err,res) => {
//         expect(res.status).to.be.equal(200);
//         done();
//     });

// })

// it("user-already-exists", (done) => {
//     userModel.create(userData).then((result) => console.log("data saved"));
//     chai.request(server).post('/api/user/registration').send(userData).end((err,res) => {
//         expect(res.status).to.be.equal(400);
//         expect(res._body.message).to.be.equal("User already exists go and login")
//         done();
//     });
// })
//})
