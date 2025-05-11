const db = require('../../../app/models')
const { ForeignKeyConstraintError } = require('sequelize')

describe("Question model", () => {

    let course
    let lecture

    beforeAll(async () => {
        course = await db.Course.create({
            name: "Test Course 1",
            description: "A course for testing the things!"
        })
        lecture = await db.Lecture.create({
            title: "Test Lecture 1",
            description: "A lecture for testing the things!",
            courseId: course.id
        })
    })

    describe("Question.create", () => {
        
        let question

        it ("should invalidate the type because it does not exist", async() => {
            await expect(db.Question.create({
                type: 'graphing',
                stem: 'Graph y = x + 1',
                content: {},
                answers: {},
                lectureId: lecture.id
            })).rejects.toThrow("Validation error: Question type is not a valid option")
        })
        
        it ("should invalidate because a stem was not provided", async() => {
            await expect(db.Question.create({
                type: 'multiple answer',
                content: {},
                answers: {},
                lectureId: lecture.id
            })).rejects.toThrow("notNull Violation: Question stem text must be provided")
        })

        it ("should invalidate because the stem provided was empty", async() => {
            await expect(db.Question.create({
                type: 'multiple answer',
                stem: '  ',
                content: {},
                answers: {},
                lectureId: lecture.id
            })).rejects.toThrow("Validation error: Question stem text must be provided")
        })

        it ("should invalidate because no lectureId was provided", async () => {
            await expect(db.Question.create({
                type: 'multiple choice',
                stem: 'What is 1 + 2?',
                content: {
                    options: {
                        0: 2,
                        1: 3,
                        2: 4,
                        3: 5
                    }
                },
                answers: {
                    0: false,
                    1: true,
                    2: false,
                    3: false
                },
            })).rejects.toThrow("notNull Violation: Question must have a lecture")
        })

        it ("should invalidate because no lecture with lectureId exists", async () => {
            await expect(db.Question.create({
                type: 'multiple choice',
                stem: 'What is 1 + 2?',
                content: {
                    options: {
                        0: 2,
                        1: 3,
                        2: 4,
                        3: 5
                    }
                },
                answers: {
                    0: false,
                    1: true,
                    2: false,
                    3: false
                },
                lectureId: lecture.id + 1,
            })).rejects.toThrow(ForeignKeyConstraintError)
        })

        describe("type: multiple choice", () => {
            it ("should create a valid multiple choice question", async () => {
                question = await db.Question.create({
                    type: 'multiple choice',
                    stem: 'What is 1 + 2?',
                    lectureId: lecture.id,
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: false,
                        1: true,
                        2: false,
                        3: false
                    },
                    })
                question = await question.reload() // this will reload data from the database so we can check access methods as well
                expect(question.type).toEqual('multiple choice')
                expect(question.stem).toEqual('What is 1 + 2?')
                expect(question.content.options).not.toBeNull()
                for (let i = 0; i < Object.entries(question.content.options); i++) {
                    expect(question.content.options[i].toEqual(i + 2))
                    if (i == 1) {
                        expect(question.answers[i]).toEqual(false)
                    }
                    else {
                        expect(question.answers[i]).toEqual(true)
                    }
                }
                await question.destroy()
            })

            it ("should invalidate content because no options were provided", async() => {
                await expect(db.Question.create({
                    type: 'multiple choice',
                    stem: 'What is 1 + 2?',
                    content: {},
                    answers: {},
                    lectureId: lecture.id,
                })).rejects.toThrow("Validation error: multiple choice question must have options")
            })

            it ("should invalidate content because not enough options were provided", async() => {
                await expect(db.Question.create({
                    type: 'multiple choice',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                        }
                    },
                    answers: {
                        0: false
                    },
                    lectureId: lecture.id,
                })).rejects.toThrow("Validation error: multiple choice question must have more than 1 option")
            })

            it ("should invalidate content because options were not indexed properly", async() => {
                await expect(db.Question.create({
                    type: 'multiple choice',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            3: 5
                        }
                    },
                    answers: {
                        0: false,
                        1: true,
                        3: false
                    },
                    lectureId: lecture.id,
                })).rejects.toThrow("Validation error: multiple choice question option indexed incorrectly or null")
            })

            it ("should invalidate content because option(s) were empty", async() => {
                await expect(db.Question.create({
                    type: 'multiple choice',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: "",
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: false,
                        1: true,
                        2: false,
                        3: false
                    },
                    lectureId: lecture.id,
                })).rejects.toThrow("Validation error: multiple choice question option must have a string or numeric value")
            })

            it ("should invalidate answers because the number of entries does not match content", async() => {
                await expect(db.Question.create({
                    type: 'multiple choice',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: false,
                        1: true,
                        2: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple choice question must have indication of correctness for each option")
            })

            it ("should invalidate answers because answers were not indexed properly", async() => {
                await expect(db.Question.create({
                    type: 'multiple choice',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: false,
                        1: true,
                        3: false,
                        4: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple choice question answer indexed incorrectly or null")
            })

            it ("should invalidate answers because answers are not boolean type", async() => {
                await expect(db.Question.create({
                    type: 'multiple choice',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: 1,
                        1: true,
                        3: false,
                        4: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple choice question answer must have a boolean value")
            })

            it ("should invalidate answers because only 1 answer can be correct", async() => {
                await expect(db.Question.create({
                    type: 'multiple choice',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: true,
                        1: true,
                        2: false,
                        3: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple choice question can only and must have 1 correct answer")
            })

        })

        describe("type: multiple answer", () => {
            it ("should create a valid multiple answer question", async () => {
                question = await db.Question.create({
                    type: 'multiple answer',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 3,
                            3: 3
                        }
                    },
                    answers: {
                        0: true,
                        1: true,
                        2: true,
                        3: false
                    },
                    lectureId: lecture.id
                })
                question = await question.reload() // this will reload data from the database so we can check access methods as well
                expect(question.type).toEqual('multiple answer')
                expect(question.stem).toEqual('What is 1 + 2?')
                expect(question.content.options).not.toBeNull()
                for (let i = 0; i < Object.entries(question.content.options); i++) {
                    
                    if (i == 0) {
                        expect(question.content.options[i].toEqual(2))
                        expect(question.answers[i]).toEqual(false)
                    }
                    else {
                        expect(question.content.options[i].toEqual(3))
                        expect(question.answers[i]).toEqual(true)
                    }
                }
                await question.destroy()
            })

            it ("should invalidate content because no options were provided", async() => {
                await expect(db.Question.create({
                    type: 'multiple answer',
                    stem: 'What is 1 + 2?',
                    content: {},
                    answers: {},
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple answer question must have options")
            })

            it ("should invalidate content because not enough options were provided", async() => {
                await expect(db.Question.create({
                    type: 'multiple answer',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                        }
                    },
                    answers: {
                        0: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple answer question must have more than 1 option")
            })

            it ("should invalidate content because options were not indexed properly", async() => {
                await expect(db.Question.create({
                    type: 'multiple answer',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            3: 5
                        }
                    },
                    answers: {
                        0: false,
                        1: true,
                        3: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple answer question option indexed incorrectly or null")
            })

            it ("should invalidate content because option(s) were empty", async() => {
                await expect(db.Question.create({
                    type: 'multiple answer',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: "",
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: false,
                        1: true,
                        2: false,
                        3: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple answer question option must have a string or numeric value")
            })

            it ("should invalidate answers because the number of entries does not match content", async() => {
                await expect(db.Question.create({
                    type: 'multiple answer',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: false,
                        1: true,
                        2: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple answer question must have indication of correctness for each option")
            })

            it ("should invalidate answers because answers were not indexed properly", async() => {
                await expect(db.Question.create({
                    type: 'multiple answer',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: false,
                        1: true,
                        3: false,
                        4: true
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple answer question answer indexed incorrectly or null")
            })

            it ("should invalidate answers because answers are not boolean type", async() => {
                await expect(db.Question.create({
                    type: 'multiple answer',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 4,
                            3: 5
                        }
                    },
                    answers: {
                        0: 1,
                        1: true,
                        3: false,
                        4: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("Validation error: multiple answer question answer must have a boolean value")
            })

            it ("should invalidate answers because there are no correct answers found", async() => {
                await expect(db.Question.create({
                    type: 'multiple answer',
                    stem: 'What is 1 + 2?',
                    content: {
                        options: {
                            0: 2,
                            1: 3,
                            2: 3,
                            3: 3
                        }
                    },
                    answers: {
                        0: false,
                        1: false,
                        2: false,
                        3: false
                    },
                    lectureId: lecture.id
                })).rejects.toThrow("multiple answer question must have at least 1 correct answer")
            })
        })
    })

    afterAll(async () => {
        await course.destroy()
    })
})