const express = require("express")
const fs = require("fs")
const path = require("path")
const uniqid = require("uniqid")
const portfolios = require("../portfolio/portfolios.json")

const router = express.Router()


const studentFilePath = path.join(__dirname, "students.json")

const getStudents = () => {
    const fileStudentsAsBuffer = fs.readFileSync(studentFilePath)
    const students = JSON.parse(fileStudentsAsBuffer.toString())
    return students
}

router.get("/", (req, res, next) => {
    const students = getStudents()
    if (students.length > 0) {
        res.send(students)
    } else {
        const error = new Error()
        error.httpStatusCode = 404
        error.message = "We dont have any data!"
        next(error)
    }
})

router.get("/:id/projects", (req, res) => {
    const studentProjects = portfolios.filter(project => project.studentId === req.params.id)

    res.send(studentProjects)
})

router.get("/:id", (req, res, next) => {
    const students = getStudents()
    if (students.length > 0) {
        const student = students.filter(student => student.id === req.params.id)
        if (student.length > 0) {
            res.status(200).send(student)
        } else {
            const error = new Error()
            error.httpStatusCode = 404
            error.message = "We cannot find a student with this ID"
            next(error)
        }
    } else {
        const error = new Error()
        error.httpStatusCode = 404
        error.message = "We dont have any data!"
        next(error)
    }
})

router.post("/", (req, res) => {
    newStudent = { id: uniqid(), ...req.body, numberOfProjects: 0 }
    const students = getStudents()
    students.push(newStudent)
    fs.writeFileSync(studentFilePath, JSON.stringify(students))
    res.status(201).send(students)

})

router.post("/checkEmail", (req, res) => {
    newStudent = req.body
    const studentsData = getStudents()
    const students = studentsData.filter(student => student.id !== newStudent.id)
    if (students.length > 0) {
        const filteredStudents = students.filter(student => student.email === newStudent.email)
        if (filteredStudents.length > 0) {
            res.status(400).send(false)
        } else {
            res.status(200).send(true)
        }
    } else {
        res.status(200).send(true)
    }

})

router.put("/:id", (req, res, next) => {
    const students = getStudents()
    if (students.length > 0) {
        const filteredStudents = students.filter(student => student.id !== req.params.id)
        const student = { id: req.params.id, ...req.body }

        filteredStudents.push(student)

        fs.writeFileSync(studentFilePath, JSON.stringify(filteredStudents))
        res.send(student)
    } else {
        const error = new Error()
        error.httpStatusCode = 404
        error.message = "We dont have any data!"
        next(error)
    }
})

router.delete("/:id", (req, res, next) => {
    const students = getStudents()
    if (students.length > 0) {
        const filteredStudents = students.filter(student => student.id !== req.params.id)
        const deletedStudent = students.filter(student => student.id === req.params.id)
        if (deletedStudent.length > 0) {
            fs.writeFileSync(studentFilePath, JSON.stringify(filteredStudents))
            res.send("That student was deleted!")
        } else {
            const error = new Error()
            error.httpStatusCode = 404
            error.message = "We dont have any student with that ID!"
            next(error)
        }
    } else {
        const error = new Error()
        error.httpStatusCode = 404
        error.message = "We dont have any data!"
        next(error)
    }
})

module.exports = router