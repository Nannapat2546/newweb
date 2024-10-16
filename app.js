const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Database configuration
const pool = new Pool({
    user: 'postgres', // เปลี่ยนเป็น username ของคุณ
    host: 'localhost',
    database: 'rollcallstudent_db',
    password: '0807780787', // เปลี่ยนเป็น password ของคุณ
    port: 5432,
});

// ตั้งค่า EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ใช้ body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// หน้าแรก
app.get('/', async (req, res) => {
    try {
        const students = await pool.query('SELECT id, first_name, last_name, date_of_birth, curriculum_id, telephone, email FROM student');
        res.render('index', { students: students.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน');
    }
});

// หน้าแสดง student_list
app.get('/student', async (req, res) => {
    try {
        const studentList = await pool.query(`
            SELECT sl.id, s.first_name, s.last_name, sl.active_date, sl.status
            FROM student_list sl
            JOIN student s ON sl.student_id = s.id
        `);
        res.render('student', { studentList: studentList.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
});


// เช็คชื่อ
app.post('/attendance', async (req, res) => {
    const { sectionId, studentId, activeDate, status } = req.body;
    try {
        await pool.query(
            'INSERT INTO student_list (section_id, student_id, active_date, status) VALUES ($1, $2, $3, $4)',
            [sectionId, studentId, activeDate, status]
        );
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการเช็คชื่อ');
    }
});

// เส้นทางสำหรับลบข้อมูลนักเรียน
app.post('/delete-student', async (req, res) => {
    const { studentId } = req.body;
    try {
        await pool.query('DELETE FROM student WHERE id = $1', [studentId]);
        res.redirect('/'); // เปลี่ยนเส้นทางไปยังหน้าหลักหลังจากลบ
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
});

// เส้นทางสำหรับเพิ่มนักเรียน
app.post('/add-student', async (req, res) => {
    const { firstName, lastName, previousSchool, address, telephone, email, lineId } = req.body;
    try {
        const curriculumId = 1; // เปลี่ยนเป็นค่า curriculum_id ที่เหมาะสม
        const prefixId = 1; // เปลี่ยนเป็นค่า prefix_id ที่เหมาะสม

        await pool.query(
            `INSERT INTO student (id, first_name, last_name, date_of_birth, curriculum_id, telephone, email,) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, first_Name, last_Name,date_of_birth, curriculumId, telephone, email,]
        );
        res.redirect('/'); // กลับไปยังหน้าหลัก
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มนักเรียน');
    }
});




// รันเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
