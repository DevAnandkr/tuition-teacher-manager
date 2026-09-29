import { useEffect, useState } from "react"

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore"

import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"

import { db, auth } from "./firebase"


const AppIcon = ({ name, size = 18, strokeWidth = 1.9 }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    students: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    attendance: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 3v3M16 3v3M4 9h16" /><path d="m8 13 2 2 4-4" /></>,
    fees: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></>,
    report: <><path d="M4 19V5" /><path d="M4 19h17" /><path d="m7 15 3-4 3 2 5-7" /><path d="M18 6h3v3" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" /><path d="M4 5.5v16" /><path d="M8 7h8" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    warning: <><path d="M12 3 2.5 20h19L12 3z" /><path d="M12 9v4M12 17h.01" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    print: <><path d="M6 9V3h12v6" /><rect x="6" y="14" width="12" height="7" rx="1" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M18 12h.01" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    present: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    absent: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.report}
    </svg>
  )
}

function App() {
  // =========================
  // AUTH
  // =========================

  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [coachingName, setCoachingName] = useState("")
  const [authError, setAuthError] = useState("")
  const [authSubmitting, setAuthSubmitting] = useState(false)

  const [teacherCoachingName, setTeacherCoachingName] =
    useState("My Coaching")

  const [teacherProfileForm, setTeacherProfileForm] = useState({
    teacherName: "",
    coachingName: "",
    phone: "",
    address: "",
    city: "",
    tagline: "",
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [legalPage, setLegalPage] = useState(null)

  // =========================
  // MAIN SECTION
  // =========================

  const [activeSection, setActiveSection] =
    useState("dashboard")

  // =========================
  // STUDENTS
  // =========================

  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const [studentSearch, setStudentSearch] = useState("")

  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudyReport, setShowStudyReport] = useState(false)
  const [studyReportSaving, setStudyReportSaving] = useState(false)
  const [studyRecordForm, setStudyRecordForm] = useState({
    type: "Notes",
    date: new Date().toISOString().split("T")[0],
    subject: "",
    title: "",
    content: "",
    marks: "",
    totalMarks: "",
    homeworkStatus: "",
  })
  const [studyRemarks, setStudyRemarks] = useState("")

  const [studentForm, setStudentForm] = useState({
    name: "",
    parentName: "",
    phone: "",
    batch: "",
    fee: "",
    joiningDate: "",
    discount: "",
  })

  const [editForm, setEditForm] = useState({
    name: "",
    parentName: "",
    phone: "",
    batch: "",
    fee: "",
    joiningDate: "",
    discount: "",
  })

  // =========================
  // ATTENDANCE
  // =========================

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  const [attendance, setAttendance] = useState({})
  const [attendanceSearch, setAttendanceSearch] = useState("")

  // =========================
  // FEES
  // =========================

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )

  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )

  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [feesSearch, setFeesSearch] = useState("")

  // =========================
  // AUTH STATE
  // =========================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser)

        if (currentUser) {
          await loadTeacherProfile(currentUser.uid)
          await loadStudents(currentUser.uid)
        } else {
          setStudents([])
          setTeacherCoachingName("My Coaching")
          setAttendance({})
        }

        setAuthLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // =========================
  // TEACHER PROFILE
  // =========================

  const loadTeacherProfile = async (uid) => {
    try {
      const teacherRef = doc(db, "teachers", uid)
      const teacherSnap = await getDoc(teacherRef)

      if (teacherSnap.exists()) {
        const data = teacherSnap.data()

        setTeacherCoachingName(
          data.coachingName || "My Coaching"
        )
        setTeacherProfileForm({
          teacherName: data.teacherName || "",
          coachingName: data.coachingName || "My Coaching",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          tagline: data.tagline || "",
        })
      } else {
        setTeacherCoachingName("My Coaching")
        setTeacherProfileForm({
          teacherName: "",
          coachingName: "My Coaching",
          phone: "",
          address: "",
          city: "",
          tagline: "",
        })
      }
    } catch (error) {
      console.error(error)
      setTeacherCoachingName("My Coaching")
    }
  }

  const saveTeacherProfile = async (e) => {
    e.preventDefault()

    if (!user) return

    const cleanCoachingName = teacherProfileForm.coachingName.trim()

    if (!cleanCoachingName) {
      alert("Coaching / Institution name enter karo.")
      return
    }

    try {
      setProfileSaving(true)

      const profileData = {
        teacherName: teacherProfileForm.teacherName.trim(),
        coachingName: cleanCoachingName,
        phone: teacherProfileForm.phone.trim(),
        address: teacherProfileForm.address.trim(),
        city: teacherProfileForm.city.trim(),
        tagline: teacherProfileForm.tagline.trim(),
        email: user.email || "",
        updatedAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "teachers", user.uid), profileData, { merge: true })

      setTeacherProfileForm((prev) => ({ ...prev, ...profileData }))
      setTeacherCoachingName(cleanCoachingName)
      alert("Teacher profile & coaching settings saved successfully.")
    } catch (error) {
      console.error(error)
      alert("Profile settings save nahi ho paayi.")
    } finally {
      setProfileSaving(false)
    }
  }

  // =========================
  // LOAD STUDENTS
  // =========================

  const loadStudents = async (uid) => {
    try {
      setLoadingStudents(true)

      const q = query(
        collection(db, "students"),
        where("teacherId", "==", uid)
      )

      const snapshot = await getDocs(q)

      const studentList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))

      setStudents(studentList)
    } catch (error) {
      console.error(error)
      alert("Students load nahi ho paaye.")
    } finally {
      setLoadingStudents(false)
    }
  }

  // =========================
  // LOGIN / SIGNUP
  // =========================

  const handleAuth = async (e) => {
    e.preventDefault()

    setAuthError("")

    if (!email.trim()) {
      setAuthError("Email enter karo.")
      return
    }

    if (!password) {
      setAuthError("Password enter karo.")
      return
    }

    if (isSignup && !coachingName.trim()) {
      setAuthError("Coaching / Institution name enter karo.")
      return
    }

    try {
      setAuthSubmitting(true)

      if (isSignup) {
        const result =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          )

        await setDoc(
          doc(db, "teachers", result.user.uid),
          {
            email: email.trim(),
            coachingName: coachingName.trim(),
            createdAt: new Date().toISOString(),
          }
        )

        setTeacherCoachingName(
          coachingName.trim()
        )
      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        )
      }
    } catch (error) {
      console.error(error)

      if (error.code === "auth/email-already-in-use") {
        setAuthError("Ye email already registered hai.")
      } else if (
        error.code === "auth/invalid-credential"
      ) {
        setAuthError("Email ya password galat hai.")
      } else if (
        error.code === "auth/weak-password"
      ) {
        setAuthError(
          "Password kam se kam 6 characters ka hona chahiye."
        )
      } else {
        setAuthError(
          error.message || "Authentication failed."
        )
      }
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error(error)
    }
  }

  // =========================
  // ADD STUDENT
  // =========================

  const handleStudentFormChange = (e) => {
    const { name, value } = e.target

    setStudentForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addStudent = async (e) => {
    e.preventDefault()

    if (!studentForm.name.trim()) {
      alert("Student name enter karo.")
      return
    }

    if (!studentForm.phone.trim()) {
      alert("Parent phone number enter karo.")
      return
    }

    if (!studentForm.batch.trim()) {
      alert("Batch enter karo.")
      return
    }

    if (!studentForm.fee) {
      alert("Monthly fee enter karo.")
      return
    }

    try {
      const newStudent = {
        name: studentForm.name.trim(),
        parentName: studentForm.parentName.trim(),
        phone: studentForm.phone.trim(),
        batch: studentForm.batch.trim(),
        fee: Number(studentForm.fee),
        joiningDate: studentForm.joiningDate,
        discount: Number(studentForm.discount || 0),
        payments: [],
        feeLedger: [],
        teacherId: user.uid,
        createdAt: new Date().toISOString(),
      }

      const docRef = await addDoc(
        collection(db, "students"),
        newStudent
      )

      setStudents((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...newStudent,
        },
      ])

      setStudentForm({
        name: "",
        parentName: "",
        phone: "",
        batch: "",
        fee: "",
        joiningDate: "",
        discount: "",
      })

      setShowAddStudent(false)

      alert("Student added successfully.")
    } catch (error) {
      console.error(error)
      alert("Student add nahi ho paaya.")
    }
  }

  // =========================
  // EDIT STUDENT
  // =========================

  const openEditStudent = (student) => {
    setEditForm({
      name: student.name || "",
      parentName: student.parentName || "",
      phone: student.phone || "",
      batch: student.batch || "",
      fee: student.fee || "",
      joiningDate: student.joiningDate || "",
      discount: student.discount || "",
    })

    setShowProfile(false)
    setShowEditStudent(true)
  }

  const updateStudent = async (e) => {
    e.preventDefault()

    if (!selectedStudent) return

    if (!editForm.name.trim()) {
      alert("Student name enter karo.")
      return
    }

    if (!editForm.phone.trim()) {
      alert("Parent phone number enter karo.")
      return
    }

    if (!editForm.batch.trim()) {
      alert("Batch enter karo.")
      return
    }

    if (!editForm.fee) {
      alert("Monthly fee enter karo.")
      return
    }

    try {
      const updatedData = {
        name: editForm.name.trim(),
        parentName: editForm.parentName.trim(),
        phone: editForm.phone.trim(),
        batch: editForm.batch.trim(),
        fee: Number(editForm.fee),
        joiningDate: editForm.joiningDate,
        discount: Number(editForm.discount || 0),
      }

      await updateDoc(
        doc(db, "students", selectedStudent.id),
        updatedData
      )

      const updatedStudent = {
        ...selectedStudent,
        ...updatedData,
      }

      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id
            ? updatedStudent
            : student
        )
      )

      setSelectedStudent(updatedStudent)
      setShowEditStudent(false)
      setShowProfile(true)

      alert("Student profile updated successfully.")
    } catch (error) {
      console.error(error)
      alert("Student profile update nahi ho paaya.")
    }
  }

  // =========================
  // DELETE STUDENT
  // =========================

  const deleteStudent = async (student) => {
    const confirmed = window.confirm(
      `Kya aap ${student.name} ko delete karna chahte ho?`
    )

    if (!confirmed) return

    try {
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("studentId", "==", student.id),
        where("teacherId", "==", user.uid)
      )

      const attendanceSnapshot =
        await getDocs(attendanceQuery)

      for (const attendanceDoc of attendanceSnapshot.docs) {
        await deleteDoc(attendanceDoc.ref)
      }

      await deleteDoc(
        doc(db, "students", student.id)
      )

      setStudents((prev) =>
        prev.filter(
          (item) => item.id !== student.id
        )
      )

      setShowProfile(false)
      setSelectedStudent(null)

      alert("Student deleted successfully.")
    } catch (error) {
      console.error(error)
      alert("Student delete nahi ho paaya.")
    }
  }

  // =========================
  // PROFILE
  // =========================

  const openProfile = (student) => {
    setSelectedStudent(student)
    setShowProfile(true)
  }

  // =========================
  // FEE HELPERS
  // =========================

  const getMonthlyFee = (student) => {
    const fee = Number(student.fee || 0)
    const discount = Number(student.discount || 0)

    return Math.max(0, fee - discount)
  }

  const getStudentFeeLedger = (student, month) => {
    return (
      student.feeLedger?.find(
        (ledger) => ledger.month === month
      ) || null
    )
  }

  const getFeePaid = (ledger) => {
    if (!ledger?.payments) return 0

    return ledger.payments.reduce(
      (total, payment) => {
        if (payment.reversed) return total

        return (
          total + Number(payment.amount || 0)
        )
      },
      0
    )
  }

  const getFeeBalance = (ledger) => {
    if (!ledger) return 0

    return (
      Number(ledger.charge || 0) -
      getFeePaid(ledger)
    )
  }

  const getFeeStatus = (ledger) => {
    if (!ledger) return "Not Created"

    const balance = getFeeBalance(ledger)

    if (balance <= 0) {
      if (
        getFeePaid(ledger) >
        Number(ledger.charge || 0)
      ) {
        return "Advance"
      }

      return "Paid"
    }

    if (getFeePaid(ledger) > 0) {
      return "Partial"
    }

    return "Due"
  }

  const getMonthName = (month) => {
    if (!month) return ""

    const [year, monthNumber] = month.split("-")

    const date = new Date(
      Number(year),
      Number(monthNumber) - 1,
      1
    )

    return date.toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    })
  }

  // =========================
  // CREATE FEE
  // =========================

  const createFeeRecord = async (student) => {
    const existingLedger =
      getStudentFeeLedger(
        student,
        selectedMonth
      )

    if (existingLedger) {
      alert(
        "Is month ka fee record already created hai."
      )
      return
    }

    try {
      const monthlyFee =
        getMonthlyFee(student)

      const newLedger = {
        month: selectedMonth,
        charge: monthlyFee,
        payments: [],
        createdAt: new Date().toISOString(),
      }

      const updatedLedger = [
        ...(student.feeLedger || []),
        newLedger,
      ]

      await updateDoc(
        doc(db, "students", student.id),
        {
          feeLedger: updatedLedger,
        }
      )

      const updatedStudent = {
        ...student,
        feeLedger: updatedLedger,
      }

      setStudents((prev) =>
        prev.map((item) =>
          item.id === student.id
            ? updatedStudent
            : item
        )
      )

      if (
        selectedStudent &&
        selectedStudent.id === student.id
      ) {
        setSelectedStudent(updatedStudent)
      }

      alert(
        `${getMonthName(
          selectedMonth
        )} fee record created.`
      )
    } catch (error) {
      console.error(error)
      alert(
        "Fee record create nahi ho paaya."
      )
    }
  }

  // =========================
  // PAYMENT
  // =========================

  const openPayment = (student) => {
    const ledger =
      getStudentFeeLedger(
        student,
        selectedMonth
      )

    if (!ledger) {
      alert(
        "Pehle is month ka fee record create karo."
      )
      return
    }

    setSelectedStudent(student)
    setPaymentAmount("")
    setPaymentMode("Cash")
    setShowPayment(true)
  }

  const recordPayment = async (e) => {
    e.preventDefault()

    if (!selectedStudent) return

    const amount = Number(paymentAmount)

    if (!amount || amount <= 0) {
      alert(
        "Valid payment amount enter karo."
      )
      return
    }

    try {
      const ledger =
        getStudentFeeLedger(
          selectedStudent,
          selectedMonth
        )

      if (!ledger) {
        alert("Fee record nahi mila.")
        return
      }

      const payment = {
        id: `${Date.now()}`,
        amount,
        date: new Date().toISOString(),
        mode: paymentMode,
        reversed: false,
        createdAt: new Date().toISOString(),
      }

      const updatedLedger = {
        ...ledger,
        payments: [
          ...(ledger.payments || []),
          payment,
        ],
      }

      const updatedFeeLedger = (
        selectedStudent.feeLedger || []
      ).map((item) =>
        item.month === selectedMonth
          ? updatedLedger
          : item
      )

      await updateDoc(
        doc(db, "students", selectedStudent.id),
        {
          feeLedger: updatedFeeLedger,
        }
      )

      const updatedStudent = {
        ...selectedStudent,
        feeLedger: updatedFeeLedger,
      }

      setStudents((prev) =>
        prev.map((item) =>
          item.id === selectedStudent.id
            ? updatedStudent
            : item
        )
      )

      setSelectedStudent(updatedStudent)
      setShowPayment(false)
      setPaymentAmount("")

      alert(
        "Payment recorded successfully."
      )
    } catch (error) {
      console.error(error)
      alert(
        "Payment record nahi ho paaya."
      )
    }
  }

  // =========================
  // REVERSE PAYMENT
  // =========================

  const reversePayment = async (
    student,
    month,
    paymentId
  ) => {
    const confirmed = window.confirm(
      "Kya aap is payment ko reverse karna chahte ho?"
    )

    if (!confirmed) return

    try {
      const ledger =
        getStudentFeeLedger(
          student,
          month
        )

      if (!ledger) return

      const updatedPayments = (
        ledger.payments || []
      ).map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              reversed: true,
              reversedAt:
                new Date().toISOString(),
            }
          : payment
      )

      const updatedLedger = {
        ...ledger,
        payments: updatedPayments,
      }

      const updatedFeeLedger = (
        student.feeLedger || []
      ).map((item) =>
        item.month === month
          ? updatedLedger
          : item
      )

      await updateDoc(
        doc(db, "students", student.id),
        {
          feeLedger: updatedFeeLedger,
        }
      )

      const updatedStudent = {
        ...student,
        feeLedger: updatedFeeLedger,
      }

      setStudents((prev) =>
        prev.map((item) =>
          item.id === student.id
            ? updatedStudent
            : item
        )
      )

      setSelectedStudent(updatedStudent)

      alert(
        "Payment reversed successfully."
      )
    } catch (error) {
      console.error(error)
      alert(
        "Payment reverse nahi ho paaya."
      )
    }
  }

  // =========================
  // STUDY REPORT
  // =========================

  const getStudyReport = (student) => {
    const report = student?.studyReport || {}
    return {
      notes: Array.isArray(report.notes) ? report.notes : [],
      tests: Array.isArray(report.tests) ? report.tests : [],
      homework: Array.isArray(report.homework) ? report.homework : [],
      topics: Array.isArray(report.topics) ? report.topics : [],
      remarks: report.remarks || "",
    }
  }

  const openStudyReport = (student) => {
    const report = getStudyReport(student)
    setSelectedStudent(student)
    setStudyRemarks(report.remarks || "")
    setStudyRecordForm({
      type: "Notes",
      date: new Date().toISOString().split("T")[0],
      subject: "",
      title: "",
      content: "",
      marks: "",
      totalMarks: "",
      homeworkStatus: "",
    })
    setShowStudyReport(true)
  }

  const handleStudyRecordChange = (e) => {
    const { name, value } = e.target
    setStudyRecordForm((prev) => ({ ...prev, [name]: value }))
  }

  const saveStudyRecord = async (e) => {
    e.preventDefault()
    if (!selectedStudent) return

    if (!studyRecordForm.subject.trim()) {
      alert("Subject enter karo.")
      return
    }
    if (!studyRecordForm.content.trim() && studyRecordForm.type !== "Test") {
      alert("Study details enter karo.")
      return
    }
    if (studyRecordForm.type === "Test" && !studyRecordForm.title.trim()) {
      alert("Test name enter karo.")
      return
    }

    try {
      setStudyReportSaving(true)
      const current = getStudyReport(selectedStudent)
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const base = {
        id,
        date: studyRecordForm.date || new Date().toISOString().split("T")[0],
        subject: studyRecordForm.subject.trim(),
        title: studyRecordForm.title.trim(),
        content: studyRecordForm.content.trim(),
        createdAt: new Date().toISOString(),
      }

      const updatedReport = {
        ...current,
        notes: [...current.notes],
        tests: [...current.tests],
        homework: [...current.homework],
        topics: [...current.topics],
        remarks: studyRemarks.trim(),
        updatedAt: new Date().toISOString(),
      }

      if (studyRecordForm.type === "Test") {
        updatedReport.tests.push({
          ...base,
          marks: Number(studyRecordForm.marks || 0),
          totalMarks: Number(studyRecordForm.totalMarks || 0),
        })
      } else if (studyRecordForm.type === "Homework") {
        updatedReport.homework.push({
          ...base,
          status: studyRecordForm.homeworkStatus || "Assigned",
        })
      } else if (studyRecordForm.type === "Topic") {
        updatedReport.topics.push(base)
      } else {
        updatedReport.notes.push(base)
      }

      await updateDoc(doc(db, "students", selectedStudent.id), {
        studyReport: updatedReport,
      })

      const updatedStudent = { ...selectedStudent, studyReport: updatedReport }
      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id ? updatedStudent : student
        )
      )
      setSelectedStudent(updatedStudent)
      setStudyRecordForm((prev) => ({
        ...prev,
        title: "",
        content: "",
        marks: "",
        totalMarks: "",
        homeworkStatus: "",
      }))
      alert(`${studyRecordForm.type} added successfully.`)
    } catch (error) {
      console.error(error)
      alert("Study report save nahi ho paaya.")
    } finally {
      setStudyReportSaving(false)
    }
  }

  const deleteStudyRecord = async (student, type, recordId) => {
    try {
      const current = getStudyReport(student)
      const key = type === "Test" ? "tests" : type === "Homework" ? "homework" : type === "Topic" ? "topics" : "notes"
      const updatedReport = {
        ...current,
        [key]: current[key].filter((item) => item.id !== recordId),
        updatedAt: new Date().toISOString(),
      }
      await updateDoc(doc(db, "students", student.id), { studyReport: updatedReport })
      const updatedStudent = { ...student, studyReport: updatedReport }
      setStudents((prev) => prev.map((item) => item.id === student.id ? updatedStudent : item))
      setSelectedStudent(updatedStudent)
    } catch (error) {
      console.error(error)
      alert("Study record delete nahi ho paaya.")
    }
  }

  const sendStudyReportWhatsApp = (student) => {
    const report = getStudyReport(student)
    let phone = String(student.phone || "").replace(/\D/g, "")
    if (!phone) {
      alert("Parent ka valid WhatsApp number available nahi hai.")
      return
    }
    if (phone.length === 10) phone = "91" + phone

    const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN") : "—"
    const lines = []
    lines.push(`Hello ${student.parentName || "Parent"},`)
    lines.push("")
    lines.push(`Study Progress Report - ${student.name}`)
    lines.push(`Batch: ${student.batch || "—"}`)
    lines.push("")

    if (report.topics.length) {
      lines.push("Topics Covered:")
      report.topics.slice().sort((a,b) => String(b.date).localeCompare(String(a.date))).slice(0, 8).forEach((item) => {
        lines.push(`• ${item.subject}: ${item.content || item.title} (${formatDate(item.date)})`)
      })
      lines.push("")
    }

    if (report.notes.length) {
      lines.push("Notes / Class Work:")
      report.notes.slice().sort((a,b) => String(b.date).localeCompare(String(a.date))).slice(0, 8).forEach((item) => {
        lines.push(`• ${item.subject}: ${item.content || item.title} (${formatDate(item.date)})`)
      })
      lines.push("")
    }

    if (report.tests.length) {
      lines.push("Test Performance:")
      report.tests.slice().sort((a,b) => String(b.date).localeCompare(String(a.date))).slice(0, 8).forEach((item) => {
        const score = item.totalMarks ? `${item.marks}/${item.totalMarks}` : `${item.marks}`
        lines.push(`• ${item.title || "Test"} - ${item.subject}: ${score} (${formatDate(item.date)})`)
      })
      lines.push("")
    }

    if (report.homework.length) {
      lines.push("Homework:")
      report.homework.slice().sort((a,b) => String(b.date).localeCompare(String(a.date))).slice(0, 8).forEach((item) => {
        lines.push(`• ${item.subject}: ${item.content || item.title} - ${item.status || "Assigned"} (${formatDate(item.date)})`)
      })
      lines.push("")
    }

    if (report.remarks) {
      lines.push(`Teacher Remarks: ${report.remarks}`)
      lines.push("")
    }

    lines.push(`Regards,\n${teacherCoachingName || "My Coaching"}`)
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`
    window.open(whatsappUrl, "_blank")
  }

  // =========================
  // WHATSAPP
  // =========================

  const sendFeeReminder = (
    student,
    month
  ) => {
    const ledger =
      getStudentFeeLedger(
        student,
        month
      )

    if (!ledger) {
      alert(
        "Pehle is month ka fee record create karo."
      )
      return
    }

    const balance =
      getFeeBalance(ledger)

    if (balance <= 0) {
      alert(
        "Is student ki koi pending fee nahi hai."
      )
      return
    }

    let phone = String(
      student.phone || ""
    ).replace(/\D/g, "")

    if (!phone) {
      alert(
        "Parent ka valid WhatsApp number available nahi hai."
      )
      return
    }

    if (phone.length === 10) {
      phone = "91" + phone
    }

    const monthName =
      getMonthName(month)

    const paid =
      getFeePaid(ledger)

    const monthlyFee =
      getMonthlyFee(student)

    const message = `Hello ${
      student.parentName || "Parent"
    },

This is a friendly reminder regarding the tuition fee of ${
      student.name
    } for ${monthName}.

Monthly Fee: ₹${monthlyFee}
Paid: ₹${paid}
Pending: ₹${balance}

Please complete the pending payment at your convenience.

Thank you,
${teacherCoachingName || "My Coaching"}`

    const whatsappUrl =
      `https://wa.me/${phone}?text=` +
      encodeURIComponent(message)

    window.open(
      whatsappUrl,
      "_blank"
    )
  }

  // =========================
  // CALL
  // =========================

  const callParent = (phone) => {
    let digits = String(
      phone || ""
    ).replace(/\D/g, "")

    if (!digits) {
      alert(
        "Valid phone number available nahi hai."
      )
      return
    }

    if (digits.length === 10) {
      digits = "91" + digits
    }

    window.open(
      `tel:+${digits}`,
      "_self"
    )
  }

  // =========================
  // ATTENDANCE
  // =========================

  const loadAttendance = async (date) => {
    if (!user) return

    try {
      const q = query(
        collection(db, "attendance"),
        where(
          "teacherId",
          "==",
          user.uid
        ),
        where(
          "date",
          "==",
          date
        )
      )

      const snapshot =
        await getDocs(q)

      const attendanceData = {}

      snapshot.docs.forEach((item) => {
        const data = item.data()

        attendanceData[
          data.studentId
        ] = {
          id: item.id,
          status: data.status,
        }
      })

      setAttendance(
        attendanceData
      )
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (user) {
      loadAttendance(
        attendanceDate
      )
    }
  }, [user, attendanceDate])

  const markAttendance = async (
    student,
    status
  ) => {
    try {
      const existing =
        attendance[student.id]

      if (existing?.id) {
        await updateDoc(
          doc(
            db,
            "attendance",
            existing.id
          ),
          {
            status,
          }
        )

        setAttendance((prev) => ({
          ...prev,
          [student.id]: {
            ...prev[student.id],
            status,
          },
        }))
      } else {
        const attendanceData = {
          studentId:
            student.id,
          teacherId:
            user.uid,
          date:
            attendanceDate,
          status,
          createdAt:
            new Date().toISOString(),
        }

        const docRef =
          await addDoc(
            collection(
              db,
              "attendance"
            ),
            attendanceData
          )

        setAttendance((prev) => ({
          ...prev,
          [student.id]: {
            id: docRef.id,
            status,
          },
        }))
      }
    } catch (error) {
      console.error(error)
      alert(
        "Attendance save nahi ho paayi."
      )
    }
  }

  // =========================
  // DASHBOARD / FEE STATS
  // =========================

  const totalStudents =
    students.length

  const monthlyFees =
    students.reduce(
      (total, student) => {
        const ledger =
          getStudentFeeLedger(
            student,
            selectedMonth
          )

        if (!ledger) return total

        return (
          total +
          Number(
            ledger.charge || 0
          )
        )
      },
      0
    )

  const collectedFees =
    students.reduce(
      (total, student) => {
        const ledger =
          getStudentFeeLedger(
            student,
            selectedMonth
          )

        if (!ledger) return total

        return (
          total +
          getFeePaid(ledger)
        )
      },
      0
    )

  const pendingFees =
    students.reduce(
      (total, student) => {
        const ledger =
          getStudentFeeLedger(
            student,
            selectedMonth
          )

        if (!ledger) return total

        return (
          total +
          Math.max(
            0,
            getFeeBalance(ledger)
          )
        )
      },
      0
    )

  // =========================
  // DASHBOARD ATTENDANCE
  // =========================

  const selectedDayPresent =
    Object.values(attendance).filter(
      (item) => item.status === "Present"
    ).length

  const selectedDayAbsent =
    Object.values(attendance).filter(
      (item) => item.status === "Absent"
    ).length

  const selectedDayMarked =
    selectedDayPresent +
    selectedDayAbsent

  const selectedDayNotMarked =
    Math.max(
      0,
      students.length -
        selectedDayMarked
    )

  const selectedDayAttendancePercentage =
    students.length > 0
      ? Math.round(
          (selectedDayPresent /
            students.length) *
            100
        )
      : 0

  // =========================
  // RECENT PAYMENTS
  // =========================

  const recentPayments =
    students
      .flatMap((student) =>
        (student.feeLedger || []).flatMap(
          (ledger) =>
            (ledger.payments || [])
              .filter(
                (payment) =>
                  !payment.reversed
              )
              .map((payment) => ({
                ...payment,
                studentName:
                  student.name,
                month:
                  ledger.month,
              }))
        )
      )
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 5)

  // =========================
  // RECENT STUDENTS
  // =========================

  const recentStudents = [
    ...students,
  ]
    .sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ) -
        new Date(
          a.createdAt || 0
        )
    )
    .slice(0, 5)

  // =========================
  // DASHBOARD FEE STUDENTS
  // =========================

  const dashboardFeeStudents =
    students
      .map((student) => {
        const ledger =
          getStudentFeeLedger(
            student,
            selectedMonth
          )

        return {
          student,
          ledger,
          balance: ledger
            ? Math.max(
                0,
                getFeeBalance(ledger)
              )
            : 0,
          paid: ledger
            ? getFeePaid(ledger)
            : 0,
        }
      })
      .filter(
        (item) =>
          item.ledger &&
          item.balance > 0
      )
      .sort(
        (a, b) =>
          b.balance - a.balance
      )
      .slice(0, 5)

  // =========================
  // SEARCH
  // =========================

  const filteredStudents =
    students.filter((student) =>
      String(student.name || "")
        .toLowerCase()
        .includes(
          studentSearch
            .trim()
            .toLowerCase()
        )
    )

  const filteredAttendanceStudents =
    students.filter((student) =>
      String(student.name || "")
        .toLowerCase()
        .includes(
          attendanceSearch
            .trim()
            .toLowerCase()
        )
    )

  const filteredFeesStudents =
    students.filter((student) =>
      String(student.name || "")
        .toLowerCase()
        .includes(
          feesSearch
            .trim()
            .toLowerCase()
        )
    )

  // =========================
  // MONTHLY REPORT DATA
  // =========================

  const monthlyReportRows = students.map((student) => {
    const ledger = getStudentFeeLedger(student, reportMonth)
    const expected = ledger
      ? Number(ledger.charge || 0)
      : getMonthlyFee(student)
    const paid = ledger ? getFeePaid(ledger) : 0
    const pending = Math.max(0, expected - paid)
    const status = ledger ? getFeeStatus(ledger) : "Not Created"

    return { student, expected, paid, pending, status }
  })

  const reportTotalExpected = monthlyReportRows.reduce(
    (sum, row) => sum + row.expected, 0
  )
  const reportTotalCollected = monthlyReportRows.reduce(
    (sum, row) => sum + row.paid, 0
  )
  const reportTotalPending = monthlyReportRows.reduce(
    (sum, row) => sum + row.pending, 0
  )
  const reportCollectionPercent = reportTotalExpected > 0
    ? Math.min(100, Math.round((reportTotalCollected / reportTotalExpected) * 100))
    : 0
  const reportPaidCount = monthlyReportRows.filter(
    (row) => row.status === "Paid" || row.status === "Advance"
  ).length
  const reportPartialCount = monthlyReportRows.filter(
    (row) => row.status === "Partial"
  ).length
  const reportPendingCount = monthlyReportRows.filter(
    (row) => row.pending > 0
  ).length
  const getReportStatusClass = (status) => {
    if (status === "Paid" || status === "Advance") return "paid"
    if (status === "Partial") return "partial"
    if (status === "Due") return "due"
    return "not-created"
  }

  // =========================
  // PRINT INDIVIDUAL STUDENT REPORT
  // =========================
  const printStudentMonthlyReport = (row) => {
    const payments = row.ledger?.payments || []
    const activePayments = payments.filter((payment) => !payment.reversed)

    const paymentRows = activePayments.length
      ? activePayments.map((payment) => `
          <tr>
            <td>${payment.date || "—"}</td>
            <td>${payment.mode || "Cash"}</td>
            <td>₹${Number(payment.amount || 0).toLocaleString("en-IN")}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="3" style="text-align:center;color:#667085">No payment recorded</td></tr>`

    const printWindow = window.open("", "_blank", "width=900,height=700")
    if (!printWindow) {
      alert("Print window blocked. Please allow pop-ups for this site.")
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${row.student.name} - ${getMonthName(reportMonth)} Report</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 36px; color: #172033; }
            .header { display:flex; justify-content:space-between; gap:20px; border-bottom:2px solid #172033; padding-bottom:18px; margin-bottom:24px; }
            h1 { margin:0 0 6px; font-size:24px; }
            h2 { margin:0; font-size:20px; }
            .muted { color:#667085; font-size:13px; }
            .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:24px 0; }
            .card { border:1px solid #e4e7ec; border-radius:10px; padding:14px; }
            .card span { display:block; color:#667085; font-size:12px; margin-bottom:6px; }
            .card strong { font-size:18px; }
            table { width:100%; border-collapse:collapse; margin-top:20px; }
            th,td { border:1px solid #e4e7ec; padding:10px; text-align:left; font-size:13px; }
            th { background:#f8fafc; }
            .status { display:inline-block; padding:5px 10px; border-radius:999px; background:#eef2ff; font-weight:700; }
            .footer { margin-top:30px; color:#667085; font-size:11px; }
            @media print { body { padding:20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${teacherCoachingName}</h1>
              <div class="muted">Monthly Fee Report</div>
            </div>
            <div style="text-align:right">
              <strong>${getMonthName(reportMonth)}</strong><br/>
              <span class="muted">Generated on ${new Date().toLocaleDateString("en-IN")}</span>
            </div>
          </div>

          <h2>${row.student.name}</h2>
          <p class="muted">Batch: ${row.student.batch || "—"} &nbsp; | &nbsp; Parent: ${row.student.parentName || "—"} &nbsp; | &nbsp; Phone: ${row.student.phone || "—"}</p>

          <div class="grid">
            <div class="card"><span>Monthly Fee</span><strong>₹${row.expected.toLocaleString("en-IN")}</strong></div>
            <div class="card"><span>Collected</span><strong>₹${row.paid.toLocaleString("en-IN")}</strong></div>
            <div class="card"><span>Pending</span><strong>₹${row.pending.toLocaleString("en-IN")}</strong></div>
            <div class="card"><span>Status</span><strong class="status">${row.status}</strong></div>
          </div>

          <h3>Payment History</h3>
          <table>
            <thead><tr><th>Date</th><th>Mode</th><th>Amount</th></tr></thead>
            <tbody>${paymentRows}</tbody>
          </table>

          <div class="footer">Tuition Teacher Manager • ${teacherCoachingName}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  // =========================
  // NAVIGATION
  // =========================

  const navigationItems = [
    {
      id: "dashboard",
      icon: "dashboard",
      title: "Dashboard",
      subtitle: "Overview & Insights",
    },
    {
      id: "students",
      icon: "students",
      title: "Students",
      subtitle: `${students.length} Students`,
    },
    {
      id: "attendance",
      icon: "attendance",
      title: "Attendance",
      subtitle: "Daily Attendance",
    },
    {
      id: "fees",
      icon: "fees",
      title: "Fees Management",
      subtitle: "Payments & Reminders",
    },
    {
      id: "monthly-report",
      icon: "report",
      title: "Monthly Report",
      subtitle: "Fee Collection Report",
    },
  ]

  // =========================
  // LEGAL / INFORMATION PAGES
  // =========================

  const legalPages = {
    terms: {
      title: "Terms & Conditions",
      kicker: "TERMS OF SERVICE",
      sections: [
        ["1. Use of the Service", "Tuition Teacher Manager is a software service intended to help teachers and coaching institutions manage students, attendance, fees and study records. You agree to use the service only for lawful educational and administrative purposes."],
        ["2. Account Responsibility", "You are responsible for keeping your login credentials secure and for all activity performed through your account. Do not share your account with unauthorized persons."],
        ["3. Student & Parent Data", "You should collect and enter student, parent and teacher information only when you have a lawful basis and the necessary permission to do so. You remain responsible for the accuracy and lawful use of information entered into your account."],
        ["4. Acceptable Use", "Do not use the service to upload unlawful, abusive, fraudulent, harmful or unauthorized content, or to interfere with the operation or security of the service."],
        ["5. WhatsApp Sharing", "WhatsApp sharing is initiated by the teacher using the device's WhatsApp functionality. The teacher is responsible for verifying the recipient and the information before sending a report or reminder."],
        ["6. Service Changes", "Features, pricing, availability and technical functionality may be changed, suspended or discontinued when reasonably necessary for maintenance, security, product improvement or business reasons."],
        ["7. Acceptance", "By creating an account or using the service, you acknowledge that you have read and accepted these Terms & Conditions. If you do not agree, please do not use the service."]
      ]
    },
    privacy: {
      title: "Privacy Policy",
      kicker: "PRIVACY",
      sections: [
        ["Information We Store", "The service may store teacher account information such as email, teacher name, coaching name, phone, address and city. It may also store student and parent information entered by the teacher, including student name, parent name, parent contact number, batch, fees, attendance and study records."],
        ["How Data Is Used", "Information is used to provide account authentication, student management, attendance, fee management, study reporting, reporting features and teacher-requested communication such as WhatsApp sharing."],
        ["Data Ownership & Responsibility", "Teachers and coaching institutions are responsible for the student and parent information they enter. Do not enter information that you are not authorized to collect or use."],
        ["Firebase & Service Providers", "The application uses Firebase services for authentication and database functionality. Data may be processed by the infrastructure providers required to operate the service."],
        ["Security", "Reasonable technical and organizational measures should be used to protect account and educational data. No internet service can guarantee absolute security."],
        ["Data Retention & Deletion", "Account and educational records may remain stored while the account is active. You may request deletion or correction of data through the support contact provided on this website, subject to applicable legal and operational requirements."],
        ["Policy Updates", "This Privacy Policy may be updated when the service, technology or legal requirements change. The latest version published on this page will apply to future use of the service."]
      ]
    },
    refund: {
      title: "Refund & Cancellation Policy",
      kicker: "SUBSCRIPTION & BILLING",
      sections: [
        ["₹99 Subscription", "If the service offers a ₹99 subscription, the applicable plan, duration and benefits will be shown before payment. The subscription fee is for access to the selected service plan."],
        ["Cancellation", "You may stop using the service at any time. Cancellation does not automatically create a refund for a subscription period that has already started."],
        ["Refunds", "Unless otherwise required by applicable law, a ₹99 subscription payment is non-refundable after the subscription has been activated. A refund may be considered for a duplicate charge, a failed transaction where the amount was debited but the subscription was not activated, or another billing error verified by the service operator."],
        ["Refund Request", "For a billing issue, contact support with the account email, transaction reference and date of payment. Do not send passwords, OTPs or payment-card credentials."],
        ["Processing", "Approved refunds will be processed through the original payment method or the payment provider's applicable mechanism. Processing time may depend on the payment provider or bank."],
        ["Changes to Pricing", "Subscription pricing and plan features may change. Any new price will apply only as communicated for a future purchase or renewal, subject to the applicable terms shown at checkout."]
      ]
    },
    contact: {
      title: "Contact Us",
      kicker: "SUPPORT",
      sections: [
        ["Customer Support", "For account, student-management, fee, study-report or subscription-related questions, contact the service operator using the support details configured for your website."],
        ["Support Email", "support@yourdomain.com"],
        ["Response Time", "Support requests are generally reviewed during normal business hours. Response time may vary depending on the nature and volume of requests."],
        ["Billing Support", "For ₹99 subscription or payment issues, include your registered account email, transaction reference and payment date so the issue can be verified efficiently."]
      ]
    },
    disclaimer: {
      title: "Disclaimer",
      kicker: "IMPORTANT INFORMATION",
      sections: [
        ["Software Tool", "Tuition Teacher Manager is an administrative software tool. It is not a school, university, tutoring authority, financial institution or legal service."],
        ["Accuracy", "Reports, calculations and records are generated from information entered by the teacher. The teacher should review important records before relying on or sharing them."],
        ["WhatsApp & Third-Party Services", "WhatsApp and other third-party services are operated independently. Their availability, policies and delivery are outside the direct control of this application."],
        ["Service Availability", "We aim to keep the service available and reliable, but uninterrupted availability, error-free operation or permanent data availability cannot be guaranteed."],
        ["Educational Decisions", "Study reports, test marks, attendance information and teacher remarks are administrative records and should not be treated as an independent assessment or guarantee of a student's academic outcome."],
        ["Third-Party Links", "If external services or links are provided, their content and privacy practices are governed by their respective operators."]
      ]
    },
    cookies: {
      title: "Cookie Policy",
      kicker: "COOKIES & ANALYTICS",
      sections: [
        ["What Cookies Are", "Cookies are small files or similar technologies that can help a website remember preferences, maintain sessions and understand how a service is used."],
        ["Essential Technologies", "Authentication and session-related technologies may be required for login and secure operation of the application. These are necessary for core functionality."],
        ["Analytics", "If analytics tools are enabled in the future, they may collect aggregated usage information such as pages or features used, device information and approximate activity patterns to improve the service."],
        ["Advertising Cookies", "The application does not need advertising cookies for its core student-management features. If advertising technology is introduced later, this policy should be updated and any required consent mechanisms should be provided."],
        ["Managing Cookies", "You can control cookies through your browser settings. Blocking essential cookies may affect login or other core functionality."],
        ["Updates", "This Cookie Policy may be updated if the technologies used by the website change."]
      ]
    }
  }

  if (legalPage) {
    const page = legalPages[legalPage]
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fc", padding: "28px 18px" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #e4e8f1", borderRadius: "18px", boxShadow: "0 12px 35px rgba(20,30,60,.06)", overflow: "hidden" }}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #edf0f5", display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".8px", color: "#667085" }}>{page.kicker}</span>
                <h1 style={{ margin: "6px 0 0", fontSize: "28px", color: "#172033" }}>{page.title}</h1>
                <p style={{ margin: "7px 0 0", color: "#667085", fontSize: "13px" }}>Tuition Teacher Manager</p>
              </div>
              <button className="secondary-btn" onClick={() => setLegalPage(null)}>Back to {user ? "App" : "Login"}</button>
            </div>
            <div style={{ padding: "28px" }}>
              {page.sections.map(([heading, body]) => (
                <section key={heading} style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 8px", fontSize: "17px", color: "#172033" }}>{heading}</h2>
                  <p style={{ margin: 0, lineHeight: 1.75, fontSize: "14px", color: "#475467" }}>{body}</p>
                </section>
              ))}
              <div style={{ marginTop: "30px", paddingTop: "16px", borderTop: "1px solid #edf0f5", fontSize: "12px", color: "#98a2b3" }}>
                Last updated: September 2026. This page is general service information and should be reviewed and customized by the service operator for its actual business, jurisdiction and payment setup.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "14px 22px", padding: "20px 10px", fontSize: "12px" }}>
            {Object.entries(legalPages).map(([key, item]) => (
              <button key={key} onClick={() => setLegalPage(key)} style={{ border: 0, background: "transparent", color: "#667085", cursor: "pointer", fontSize: "12px" }}>{item.title}</button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // =========================
  // AUTH LOADING
  // =========================

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-card">
          <div className="loading-logo">
            TT
          </div>

          <h2>
            Tuition Teacher Manager
          </h2>

          <p>
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  // =========================
  // LOGIN PAGE
  // =========================

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-decoration auth-decoration-one"></div>

        <div className="auth-decoration auth-decoration-two"></div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              TT
            </div>

            <div>
              <h1>
                Tuition Teacher Manager
              </h1>

              <p>
                Manage students, fees & attendance easily.
              </p>
            </div>
          </div>

          <form
            className="auth-form"
            onSubmit={handleAuth}
          >
            <div className="form-group">
              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />
            </div>

            {isSignup && (
              <div className="form-group">
                <label>
                  Coaching / Institution Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Anand Academy"
                  value={coachingName}
                  onChange={(e) =>
                    setCoachingName(
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            {authError && (
              <div className="auth-error">
                {authError}
              </div>
            )}

            <button
              className="primary-btn full-width"
              type="submit"
              disabled={authSubmitting}
            >
              {authSubmitting
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>
          </form>

          <div className="auth-switch">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setIsSignup(
                  !isSignup
                )
                setAuthError("")
              }}
            >
              {isSignup
                ? "Login"
                : "Create Account"}
            </button>
          <div className="legal-footer-links" style={{ marginTop: "22px", paddingTop: "16px", borderTop: "1px solid #edf0f5", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px 16px" }}>
            {Object.entries(legalPages).map(([key, item]) => (
              <button key={key} type="button" onClick={() => setLegalPage(key)} style={{ border: 0, background: "transparent", color: "#667085", cursor: "pointer", fontSize: "11px" }}>{item.title}</button>
            ))}
          </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================
  // MAIN DASHBOARD
  // =========================

  return (
    <div className="dashboard">

      {/* =========================
          MOBILE RESPONSIVE STYLES
      ========================= */}
      <style>{`
        .main-app-layout {
          width: 100%;
        }

        .app-sidebar {
          min-width: 0;
        }

        .main-content {
          min-width: 0;
        }

        .mobile-only-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .report-stat-card { padding: 18px; border: 1px solid #e5e7eb; border-radius: 16px; background: #fff; }
        .report-stat-card span, .report-status-card span { display: block; color: #667085; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
        .report-stat-card strong { display: block; margin-top: 7px; color: #172033; font-size: 22px; }
        .report-status-card { padding: 14px 16px; border: 1px solid #eef0f4; border-radius: 14px; background: #f8fafc; }
        .report-status-card strong { display: block; margin-top: 5px; color: #172033; font-size: 18px; }
        .report-status { display: inline-flex; align-items: center; justify-content: center; min-width: 78px; padding: 5px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .report-status.paid { color: #166534; background: #dcfce7; }
        .report-status.partial { color: #92400e; background: #fef3c7; }
        .report-status.due { color: #b42318; background: #fee4e2; }
        .report-status.not-created { color: #475467; background: #f2f4f7; }
        @media print { body * { visibility: hidden !important; } .main-content, .main-content * { visibility: visible !important; } .app-sidebar, .topbar, .welcome-banner, .stats-grid, .report-actions { display: none !important; } .main-content { position: absolute; left: 0; top: 0; width: 100%; } .section-card { box-shadow: none !important; border: none !important; } }

        @media (max-width: 900px) {
          .dashboard {
            padding: 16px !important;
          }

          .main-app-layout {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .app-sidebar {
            position: static !important;
            width: 100% !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            display: flex !important;
            align-items: center;
            gap: 6px;
            padding: 8px !important;
            border-radius: 16px !important;
            scrollbar-width: none;
          }

          .app-sidebar::-webkit-scrollbar {
            display: none;
          }

          .app-sidebar > div:first-child {
            display: none !important;
          }

          .app-sidebar button {
            width: auto !important;
            min-width: 135px;
            margin-bottom: 0 !important;
            flex-shrink: 0;
          }

          .main-content {
            width: 100%;
            min-width: 0 !important;
          }

          .section-card {
            width: 100%;
            overflow: hidden;
          }

          .auth-page {
            padding: 18px !important;
          }
        }

        /* Professional student table actions */
        .student-actions-heading {
          width: 245px;
          min-width: 245px;
          text-align: center !important;
        }

        .student-actions-cell {
          width: 245px;
          min-width: 245px;
          vertical-align: middle !important;
        }

        .student-row-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          white-space: nowrap;
        }

        .student-action-btn {
          min-width: 102px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 11px;
          border-radius: 9px;
          border: 1px solid transparent;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          cursor: pointer;
          transition: all 0.18s ease;
          box-sizing: border-box;
        }

        .student-action-view {
          color: #344054;
          background: #ffffff;
          border-color: #dfe3eb;
        }

        .student-action-view:hover {
          background: #f8f9fc;
          border-color: #c9cfda;
          transform: translateY(-1px);
        }

        .student-action-study {
          min-width: 116px;
          color: #4f46e5;
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .student-action-study:hover {
          background: #ede9fe;
          border-color: #c4b5fd;
          transform: translateY(-1px);
        }

        .profile-action-btn {
          min-width: 138px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 12px !important;
          font-weight: 700 !important;
        }

        .profile-delete-btn {
          min-width: 150px;
        }

        .profile-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          padding: 16px 0 4px;
          border-top: 1px solid #eef0f4;
        }

        .profile-actions > button {
          margin: 0 !important;
        }

        .modal-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 40px;
          font-size: 12px !important;
          font-weight: 700 !important;
        }

        .table-wrapper table th,
        .table-wrapper table td {
          vertical-align: middle;
        }

        .table-wrapper table th {
          height: 48px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.35px;
        }

        .table-wrapper table td {
          height: 66px;
          font-size: 12px;
        }

        .student-cell {
          min-width: 180px;
        }

        .student-cell strong {
          font-size: 13px;
          line-height: 1.3;
        }

        .student-cell small {
          display: block;
          margin-top: 4px;
          font-size: 10px;
          color: #98a2b3;
          line-height: 1.3;
        }

        .action-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          flex-wrap: nowrap;
        }

        .action-row button {
          min-width: 76px;
          height: 34px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px !important;
          font-weight: 700 !important;
        }

        .profile-menu-wrap {
          position: relative;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid #e3e7ef;
          background: #ffffff;
          border-radius: 12px;
          padding: 6px 10px 6px 7px;
          cursor: pointer;
          color: #172033;
          transition: all 0.2s ease;
        }

        .profile-trigger:hover,
        .profile-trigger.active {
          border-color: #c7d2fe;
          background: #f8f9ff;
        }

        .profile-avatar,
        .profile-dropdown-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #eef2ff, #ede9fe);
          color: #4f46e5;
        }

        .profile-avatar {
          width: 34px;
          height: 34px;
        }

        .profile-trigger-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.15;
          min-width: 0;
        }

        .profile-trigger-text strong {
          font-size: 12px;
          max-width: 145px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-trigger-text small {
          margin-top: 3px;
          font-size: 10px;
          color: #7a8496;
          max-width: 145px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-chevron {
          font-size: 17px;
          color: #7a8496;
          line-height: 1;
          margin-left: 2px;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 310px;
          background: #ffffff;
          border: 1px solid #e7eaf0;
          border-radius: 16px;
          box-shadow: 0 18px 45px rgba(23, 32, 51, 0.14);
          padding: 10px;
          z-index: 1000;
        }

        .profile-dropdown-header {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 8px 12px;
          border-bottom: 1px solid #eef0f4;
        }

        .profile-dropdown-avatar {
          width: 42px;
          height: 42px;
        }

        .profile-dropdown-header div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .profile-dropdown-header strong {
          font-size: 14px;
          color: #172033;
        }

        .profile-dropdown-header span {
          font-size: 11px;
          color: #7a8496;
          margin-top: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-dropdown-info {
          padding: 10px 8px;
          display: grid;
          gap: 8px;
        }

        .profile-dropdown-info div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .profile-dropdown-info span {
          font-size: 10px;
          color: #98a2b3;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-weight: 700;
        }

        .profile-dropdown-info strong {
          font-size: 12px;
          color: #344054;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-dropdown-action,
        .profile-dropdown-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 10px;
          border-radius: 10px;
          border: 0;
          cursor: pointer;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          background: transparent;
        }

        .profile-dropdown-action {
          color: #344054;
        }

        .profile-dropdown-action:hover {
          background: #f5f7ff;
          color: #4f46e5;
        }

        .profile-dropdown-logout {
          color: #b42318;
          margin-top: 3px;
        }

        .profile-dropdown-logout:hover {
          background: #fff4f2;
        }

        .profile-settings-grid { width: 100%; }

        @media (max-width: 600px) {
          .student-actions-heading,
          .student-actions-cell {
            width: 245px !important;
            min-width: 245px !important;
          }

          .student-row-actions {
            justify-content: flex-start;
          }

          .profile-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            padding-top: 14px !important;
          }

          .profile-actions > button {
            width: 100% !important;
            min-width: 0 !important;
          }

          .profile-delete-btn {
            grid-column: 1 / -1;
          }

          .modal-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            width: 100% !important;
          }

          .modal-actions button {
            width: 100% !important;
            min-width: 0 !important;
          }


          .profile-settings-grid { grid-template-columns: 1fr !important; }
          * {
            box-sizing: border-box;
          }

          body {
            overflow-x: hidden;
          }

          .dashboard {
            width: 100% !important;
            max-width: 100% !important;
            padding: 10px !important;
            overflow-x: hidden;
          }

          .topbar {
            padding: 12px !important;
            border-radius: 14px !important;
            gap: 10px !important;
          }

          .brand-area {
            min-width: 0;
            gap: 9px !important;
          }

          .brand-logo {
            width: 38px !important;
            height: 38px !important;
            min-width: 38px !important;
            font-size: 13px !important;
          }

          .brand-area h1 {
            font-size: 14px !important;
            line-height: 1.2 !important;
          }

          .brand-area p {
            font-size: 10px !important;
            margin-top: 2px !important;
          }

          .topbar-right {
            gap: 6px !important;
          }

          .teacher-email {
            display: none !important;
          }

          .profile-trigger-text,
          .profile-chevron {
            display: none !important;
          }

          .profile-trigger {
            padding: 4px;
            border-radius: 50%;
          }

          .profile-avatar {
            width: 34px;
            height: 34px;
          }

          .profile-dropdown {
            position: fixed;
            top: 68px;
            right: 10px;
            left: 10px;
            width: auto;
          }

          .logout-btn {
            padding: 8px 10px !important;
            font-size: 11px !important;
            white-space: nowrap;
          }

          .welcome-banner {
            padding: 18px !important;
            border-radius: 16px !important;
            margin-top: 10px !important;
          }

          .welcome-banner h2 {
            font-size: 20px !important;
            line-height: 1.25 !important;
          }

          .welcome-banner p {
            font-size: 12px !important;
            line-height: 1.5 !important;
          }

          .welcome-icon {
            display: none !important;
          }

          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin-top: 10px !important;
          }

          .stat-card {
            padding: 13px !important;
            border-radius: 14px !important;
            min-width: 0 !important;
          }

          .stat-icon {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            font-size: 15px !important;
          }

          .stat-card span {
            font-size: 9px !important;
          }

          .stat-card strong {
            font-size: 17px !important;
          }

          .app-sidebar {
            display: flex !important;
            flex-direction: row !important;
            width: 100% !important;
            padding: 7px !important;
            border-radius: 14px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scrollbar-width: none;
          }

          .app-sidebar::-webkit-scrollbar {
            display: none;
          }

          .app-sidebar button {
            min-width: 112px !important;
            padding: 8px !important;
            border-radius: 10px !important;
            gap: 7px !important;
          }

          .app-sidebar button > span:first-child {
            width: 30px !important;
            height: 30px !important;
            min-width: 30px !important;
            border-radius: 8px !important;
            font-size: 15px !important;
          }

          .app-sidebar button strong {
            font-size: 11px !important;
          }

          .app-sidebar button small {
            display: none !important;
          }

          .main-content {
            width: 100% !important;
            overflow: hidden !important;
          }

          .section-card {
            padding: 15px !important;
            border-radius: 15px !important;
            margin-bottom: 10px !important;
          }

          .section-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }

          .section-header h2 {
            font-size: 20px !important;
          }

          .section-header p {
            font-size: 12px !important;
          }

          .dashboard-grid,
          .content-grid {
            grid-template-columns: 1fr !important;
          }

          .quick-actions {
            grid-template-columns: 1fr !important;
          }

          .fee-list,
          .attendance-list,
          .student-list,
          .students-list {
            width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }

          .fee-row {
            min-width: 560px;
          }

          .attendance-row {
            min-width: 600px;
          }

          .student-row {
            min-width: 650px;
          }

          .form-grid {
            grid-template-columns: 1fr !important;
          }

          .form-group {
            width: 100% !important;
          }

          .form-group input,
          .form-group select,
          .form-group textarea {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px !important;
          }

          .primary-btn,
          .secondary-btn,
          .whatsapp-btn,
          .call-btn,
          .danger-btn {
            min-height: 42px;
            font-size: 12px !important;
          }

          .modal-actions {
            flex-direction: column-reverse !important;
            width: 100% !important;
            gap: 8px !important;
          }

          .modal-actions button {
            width: 100% !important;
          }

          .modal-overlay {
            padding: 10px !important;
          }

          .modal {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 92vh !important;
            overflow-y: auto !important;
            border-radius: 18px !important;
            padding: 18px !important;
          }

          .fee-management-grid {
            grid-template-columns: 1fr !important;
          }

          .fee-summary,
          .report-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .report-table-wrapper {
            width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }

          .report-table {
            min-width: 700px !important;
          }

          .profile-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }

          .profile-actions button:last-child {
            grid-column: 1 / -1;
          }

          .ledger-top,
          .ledger-summary {
            gap: 10px !important;
            flex-wrap: wrap !important;
          }

          .payment-item {
            gap: 10px !important;
          }

          .auth-page {
            min-height: 100dvh !important;
            padding: 12px !important;
          }

          .auth-card {
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
            border-radius: 18px !important;
          }

          .auth-header {
            gap: 10px !important;
          }

          .auth-header h1 {
            font-size: 19px !important;
          }

          .auth-header p {
            font-size: 11px !important;
            line-height: 1.45 !important;
          }
        }

        @media (max-width: 600px) {
          .report-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .report-status-grid { grid-template-columns: 1fr !important; }
          .report-actions { width: 100%; }
          .report-actions .month-input, .report-actions .report-print-btn { flex: 1; }
        }

        @media (max-width: 380px) {
          .dashboard {
            padding: 7px !important;
          }

          .stats-grid {
            gap: 6px !important;
          }

          .stat-card {
            padding: 10px !important;
          }

          .stat-card strong {
            font-size: 15px !important;
          }

          .stat-card span {
            font-size: 8px !important;
          }

          .welcome-banner h2 {
            font-size: 18px !important;
          }

          .app-sidebar button {
            min-width: 100px !important;
          }

          .app-sidebar button strong {
            font-size: 10px !important;
          }

          .profile-actions {
            grid-template-columns: 1fr !important;
          }

          .profile-actions button:last-child {
            grid-column: auto;
          }
        }
      `}</style>

      {/* =========================
          TOP BAR
      ========================= */}

      <header className="topbar">
        <div className="brand-area">
          <div className="brand-logo">
            TT
          </div>

          <div>
            <h1>
              Tuition Teacher Manager
            </h1>

            <p>
              <strong>
                {teacherCoachingName}
              </strong>
            </p>
          </div>
        </div>

        <div className="topbar-right profile-menu-wrap">
          <button
            type="button"
            className={`profile-trigger ${profileMenuOpen ? "active" : ""}`}
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-label="Open teacher profile"
          >
            <span className="profile-avatar">
              <AppIcon name="profile" size={19} />
            </span>
            <span className="profile-trigger-text">
              <strong>{teacherProfileForm.teacherName || "Teacher"}</strong>
              <small>{teacherCoachingName}</small>
            </span>
            <span className="profile-chevron">⌄</span>
          </button>

          {profileMenuOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">
                  <AppIcon name="profile" size={22} />
                </div>
                <div>
                  <strong>{teacherProfileForm.teacherName || "Teacher"}</strong>
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="profile-dropdown-info">
                <div>
                  <span>Coaching</span>
                  <strong>{teacherCoachingName}</strong>
                </div>
                {teacherProfileForm.phone && (
                  <div>
                    <span>Contact</span>
                    <strong>{teacherProfileForm.phone}</strong>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="profile-dropdown-action"
                onClick={() => {
                  setActiveSection("profile-settings")
                  setProfileMenuOpen(false)
                }}
              >
                <AppIcon name="profile" size={17} />
                <span>Edit Profile & Coaching Settings</span>
              </button>

              <button
                type="button"
                className="profile-dropdown-logout"
                onClick={() => {
                  setProfileMenuOpen(false)
                  handleLogout()
                }}
              >
                <AppIcon name="warning" size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* =========================
          WELCOME BANNER
      ========================= */}

      <section className="welcome-banner">
        <div>
          <span className="welcome-label">
            {teacherCoachingName}
          </span>

          <h2>
            Welcome back, Teacher
          </h2>

          <p>
            Manage your students, attendance
            and fees from one place.
          </p>
        </div>

        <div className="welcome-icon">
          <AppIcon name="book" size={26} />
        </div>
      </section>

      {/* =========================
          TOP STATS
      ========================= */}

      <div className="stats-grid">

        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <AppIcon name="students" size={20} />
          </div>

          <div>
            <span>
              Total Students
            </span>

            <strong>
              {totalStudents}
            </strong>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">
            ₹
          </div>

          <div>
            <span>
              Monthly Fees
            </span>

            <strong>
              ₹{monthlyFees}
            </strong>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">
            <AppIcon name="check" size={20} />
          </div>

          <div>
            <span>
              Collected
            </span>

            <strong>
              ₹{collectedFees}
            </strong>
          </div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-icon">
            <AppIcon name="warning" size={20} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              ₹{pendingFees}
            </strong>
          </div>
        </div>

      </div>

      {/* =========================
          MAIN APP LAYOUT
      ========================= */}

      <div
        className="main-app-layout"
        style={{
          display: "grid",
          gridTemplateColumns:
            "240px minmax(0, 1fr)",
          gap: "20px",
          alignItems: "start",
        }}
      >

        {/* =========================
            SIDEBAR
        ========================= */}

        <aside
          className="app-sidebar"
          style={{
            background: "#ffffff",
            border: "1px solid #e4e8f1",
            borderRadius: "20px",
            padding: "12px",
            boxShadow:
              "0 7px 25px rgba(20, 30, 60, 0.045)",
            position: "sticky",
            top: "20px",
          }}
        >

          <div
            style={{
              padding:
                "14px 12px 12px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#7a8496",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "1px",
                marginBottom: "5px",
              }}
            >
              MANAGEMENT
            </span>

            <strong
              style={{
                display: "block",
                fontSize: "15px",
                color: "#172033",
              }}
            >
              {teacherCoachingName}
            </strong>
          </div>

          {navigationItems.map(
            (item) => {
              const isActive =
                activeSection ===
                item.id

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setActiveSection(
                      item.id
                    )
                  }
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding:
                      "13px 12px",
                    marginBottom: "6px",
                    borderRadius: "12px",
                    border: isActive
                      ? "1px solid #c7d2fe"
                      : "1px solid transparent",
                    background:
                      isActive
                        ? "linear-gradient(135deg, #eef2ff, #f5f3ff)"
                        : "transparent",
                    color:
                      isActive
                        ? "#4f46e5"
                        : "#667085",
                    textAlign: "left",
                    cursor: "pointer",
                    transition:
                      "all 0.18s ease",
                  }}
                >
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      background:
                        isActive
                          ? "#ffffff"
                          : "#f5f7fb",
                      fontSize: "18px",
                      boxShadow:
                        isActive
                          ? "0 4px 12px rgba(79,70,229,0.08)"
                          : "none",
                    }}
                  >
                    <AppIcon name={item.icon} size={19} />
                  </span>

                  <span>
                    <strong
                      style={{
                        display:
                          "block",
                        fontSize:
                          "13px",
                        color:
                          isActive
                            ? "#3730a3"
                            : "#344054",
                      }}
                    >
                      {item.title}
                    </strong>

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "3px",
                        color:
                          isActive
                            ? "#6366f1"
                            : "#98a2b3",
                        fontSize:
                          "10px",
                      }}
                    >
                      {item.subtitle}
                    </small>
                  </span>
                </button>
              )
            }
          )}
        </aside>

        {/* =========================
            RIGHT CONTENT
        ========================= */}

        <main
          className="main-content"
          style={{
            minWidth: 0,
          }}
        >

          {/* =====================================================
              DASHBOARD OVERVIEW
          ===================================================== */}

          {activeSection ===
            "dashboard" && (
            <section>

              {/* HEADER */}

              <div className="section-card">
                <div
                  className="section-header"
                  style={{
                    alignItems:
                      "center",
                  }}
                >
                  <div>
                    <span className="section-kicker">
                      DASHBOARD
                    </span>

                    <h2>
                      Overview & Insights
                    </h2>

                    <p>
                      Your coaching activity at
                      a glance.
                    </p>
                  </div>

                  <div
                    style={{
                      textAlign:
                        "right",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "block",
                        color:
                          "#98a2b3",
                        fontSize:
                          "11px",
                        fontWeight:
                          "700",
                        marginBottom:
                          "4px",
                      }}
                    >
                      SELECTED DAY
                    </span>

                    <strong
                      style={{
                        color:
                          "#172033",
                        fontSize:
                          "14px",
                      }}
                    >
                      {new Date(
                        `${attendanceDate}T00:00:00`
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          weekday:
                            "short",
                          day: "numeric",
                          month:
                            "short",
                          year:
                            "numeric",
                        }
                      )}
                    </strong>
                  </div>
                </div>

                {/* ATTENDANCE OVERVIEW */}

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(4, minmax(0, 1fr))",
                    gap: "12px",
                    marginTop:
                      "20px",
                  }}
                >

                  <div
                    style={{
                      padding:
                        "18px",
                      borderRadius:
                        "16px",
                      background:
                        "#f0fdf4",
                      border:
                        "1px solid #dcfce7",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "block",
                        fontSize:
                          "11px",
                        color:
                          "#15803d",
                        fontWeight:
                          "700",
                      }}
                    >
                      PRESENT
                    </span>

                    <strong
                      style={{
                        display:
                          "block",
                        fontSize:
                          "28px",
                        marginTop:
                          "6px",
                        color:
                          "#166534",
                      }}
                    >
                      {selectedDayPresent}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding:
                        "18px",
                      borderRadius:
                        "16px",
                      background:
                        "#fff1f2",
                      border:
                        "1px solid #ffe4e6",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "block",
                        fontSize:
                          "11px",
                        color:
                          "#be123c",
                        fontWeight:
                          "700",
                      }}
                    >
                      ABSENT
                    </span>

                    <strong
                      style={{
                        display:
                          "block",
                        fontSize:
                          "28px",
                        marginTop:
                          "6px",
                        color:
                          "#9f1239",
                      }}
                    >
                      {selectedDayAbsent}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding:
                        "18px",
                      borderRadius:
                        "16px",
                      background:
                        "#fff7ed",
                      border:
                        "1px solid #ffedd5",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "block",
                        fontSize:
                          "11px",
                        color:
                          "#c2410c",
                        fontWeight:
                          "700",
                      }}
                    >
                      NOT MARKED
                    </span>

                    <strong
                      style={{
                        display:
                          "block",
                        fontSize:
                          "28px",
                        marginTop:
                          "6px",
                        color:
                          "#9a3412",
                      }}
                    >
                      {selectedDayNotMarked}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding:
                        "18px",
                      borderRadius:
                        "16px",
                      background:
                        "#eef2ff",
                      border:
                        "1px solid #e0e7ff",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "block",
                        fontSize:
                          "11px",
                        color:
                          "#4f46e5",
                        fontWeight:
                          "700",
                      }}
                    >
                      ATTENDANCE
                    </span>

                    <strong
                      style={{
                        display:
                          "block",
                        fontSize:
                          "28px",
                        marginTop:
                          "6px",
                        color:
                          "#3730a3",
                      }}
                    >
                      {selectedDayAttendancePercentage}%
                    </strong>
                  </div>

                </div>
              </div>

              {/* QUICK ACTIONS */}

              <div
                className="section-card"
                style={{
                  marginTop:
                    "20px",
                }}
              >
                <div className="section-header">
                  <div>
                    <span className="section-kicker">
                      QUICK ACTIONS
                    </span>

                    <h2>
                      Get things done quickly
                    </h2>

                    <p>
                      Common actions for your daily
                      coaching work.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(3, minmax(0, 1fr))",
                    gap: "14px",
                  }}
                >

                  <button
                    onClick={() =>
                      setShowAddStudent(
                        true
                      )
                    }
                    style={{
                      border:
                        "1px solid #e0e7ff",
                      background:
                        "#f8faff",
                      borderRadius:
                        "16px",
                      padding:
                        "20px",
                      textAlign:
                        "left",
                      cursor:
                        "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "25px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      <AppIcon name="students" size={25} />
                    </div>

                    <strong
                      style={{
                        display:
                          "block",
                        color:
                          "#172033",
                        fontSize:
                          "14px",
                      }}
                    >
                      Add Student
                    </strong>

                    <span
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#7a8496",
                        fontSize:
                          "11px",
                      }}
                    >
                      Add a new student
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveSection(
                        "attendance"
                      )
                    }
                    style={{
                      border:
                        "1px solid #dcfce7",
                      background:
                        "#f7fff9",
                      borderRadius:
                        "16px",
                      padding:
                        "20px",
                      textAlign:
                        "left",
                      cursor:
                        "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "25px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      <AppIcon name="attendance" size={25} />
                    </div>

                    <strong
                      style={{
                        display:
                          "block",
                        color:
                          "#172033",
                        fontSize:
                          "14px",
                      }}
                    >
                      Mark Attendance
                    </strong>

                    <span
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#7a8496",
                        fontSize:
                          "11px",
                      }}
                    >
                      Mark today's attendance
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveSection(
                        "fees"
                      )
                    }
                    style={{
                      border:
                        "1px solid #ffedd5",
                      background:
                        "#fffaf5",
                      borderRadius:
                        "16px",
                      padding:
                        "20px",
                      textAlign:
                        "left",
                      cursor:
                        "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "25px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      <AppIcon name="fees" size={25} />
                    </div>

                    <strong
                      style={{
                        display:
                          "block",
                        color:
                          "#172033",
                        fontSize:
                          "14px",
                      }}
                    >
                      Manage Fees
                    </strong>

                    <span
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#7a8496",
                        fontSize:
                          "11px",
                      }}
                    >
                      Payments & reminders
                    </span>
                  </button>

                </div>
              </div>

              {/* RECENT PAYMENTS + RECENT STUDENTS */}

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "20px",
                  marginTop:
                    "20px",
                }}
              >

                {/* RECENT PAYMENTS */}

                <div className="section-card">

                  <div className="section-header">
                    <div>
                      <span className="section-kicker">
                        PAYMENTS
                      </span>

                      <h2>
                        Recent Payments
                      </h2>
                    </div>

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        setActiveSection(
                          "fees"
                        )
                      }
                    >
                      View All
                    </button>
                  </div>

                  {recentPayments.length ===
                  0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <AppIcon name="fees" size={20} />
                      </div>

                      <h3>
                        No payments yet
                      </h3>

                      <p>
                        Recent payments will appear
                        here.
                      </p>
                    </div>
                  ) : (
                    <div className="fee-list">
                      {recentPayments.map(
                        (payment) => (
                          <div
                            className="fee-row"
                            key={`${payment.id}-${payment.month}`}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "minmax(0, 1fr) 82px 96px",
                              alignItems: "center",
                              gap: "12px",
                              minWidth: 0,
                            }}
                          >
                            <div
                              className="fee-student"
                              style={{ minWidth: 0 }}
                            >
                              <div className="student-avatar small">
                                {payment.studentName?.charAt(0)?.toUpperCase()}
                              </div>

                              <div style={{ minWidth: 0 }}>
                                <strong
                                  style={{
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {payment.studentName}
                                </strong>
                                <small>{getMonthName(payment.month)}</small>
                              </div>
                            </div>

                            <span
                              style={{
                                width: "82px",
                                justifySelf: "center",
                                textAlign: "center",
                                padding: "5px 6px",
                                borderRadius: "7px",
                                background: "#f5f7fb",
                                color: "#667085",
                                fontSize: "11px",
                                fontWeight: "700",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {payment.mode || "Cash"}
                            </span>

                            <strong
                              style={{
                                width: "96px",
                                justifySelf: "end",
                                textAlign: "right",
                                color: "#15803d",
                                fontSize: "14px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              + ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  )}

                </div>

                {/* RECENT STUDENTS */}

                <div className="section-card">

                  <div className="section-header">
                    <div>
                      <span className="section-kicker">
                        STUDENTS
                      </span>

                      <h2>
                        Recent Students
                      </h2>
                    </div>

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        setActiveSection(
                          "students"
                        )
                      }
                    >
                      View All
                    </button>
                  </div>

                  {recentStudents.length ===
                  0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <AppIcon name="students" size={28} />
                      </div>

                      <h3>
                        No students yet
                      </h3>

                      <p>
                        Add students to see them
                        here.
                      </p>
                    </div>
                  ) : (
                    <div className="attendance-list">
                      {recentStudents.map(
                        (student) => (
                          <div
                            className="attendance-row"
                            key={
                              student.id
                            }
                          >
                            <div className="student-cell">
                              <div className="student-avatar small">
                                {student.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {
                                    student.name
                                  }
                                </strong>

                                <small>
                                  {
                                    student.batch
                                  }
                                </small>
                              </div>
                            </div>

                            <button
                              className="secondary-btn"
                              onClick={() =>
                                openProfile(
                                  student
                                )
                              }
                            >
                              View
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}

                </div>

              </div>

              {/* FEE SUMMARY */}

              <div
                className="section-card"
                style={{
                  marginTop:
                    "20px",
                }}
              >

                <div className="section-header">
                  <div>
                    <span className="section-kicker">
                      FEE SUMMARY
                    </span>

                    <h2>
                      {getMonthName(
                        selectedMonth
                      )}
                    </h2>

                    <p>
                      Students with pending fees
                      for the selected month.
                    </p>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setActiveSection(
                        "fees"
                      )
                    }
                  >
                    Manage Fees
                  </button>
                </div>

                {dashboardFeeStudents.length ===
                0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <AppIcon name="check" size={28} />
                    </div>

                    <h3>
                      No pending fees
                    </h3>

                    <p>
                      No pending fee record found
                      for this month.
                    </p>
                  </div>
                ) : (
                  <div className="fee-list">
                    {dashboardFeeStudents.map(
                      ({
                        student,
                        ledger,
                        balance,
                        paid,
                      }) => (
                        <div
                          className="fee-row"
                          key={
                            student.id
                          }
                        >
                          <div className="fee-student">
                            <div className="student-avatar small">
                              {student.name
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {
                                  student.name
                                }
                              </strong>

                              <small>
                                Paid ₹
                                {paid} of ₹
                                {
                                  ledger.charge
                                }
                              </small>
                            </div>
                          </div>

                          <div
                            style={{
                              marginLeft:
                                "auto",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "10px",
                            }}
                          >
                            <strong className="pending-text">
                              ₹{balance}
                            </strong>

                            <button
                              className="whatsapp-btn"
                              onClick={() =>
                                sendFeeReminder(
                                  student,
                                  selectedMonth
                                )
                              }
                            >
                              WhatsApp
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

              </div>

            </section>
          )}

          {/* =====================================================
              STUDENTS SECTION
          ===================================================== */}

          {activeSection ===
            "students" && (
            <section className="section-card">

              <div
                className="section-header"
                style={{
                  alignItems:
                    "center",
                }}
              >
                <div>
                  <span className="section-kicker">
                    STUDENTS
                  </span>

                  <h2>
                    Student Management
                  </h2>

                  <p>
                    Add and manage all your
                    tuition students.
                  </p>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "10px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <span
                      style={{
                        position:
                          "absolute",
                        left:
                          "12px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        fontSize:
                          "15px",
                        color:
                          "#98a2b3",
                        pointerEvents:
                          "none",
                      }}
                    >
                      <AppIcon name="search" size={16} />
                    </span>

                    <input
                      type="text"
                      placeholder="Search student..."
                      value={
                        studentSearch
                      }
                      onChange={(e) =>
                        setStudentSearch(
                          e.target.value
                        )
                      }
                      style={{
                        width:
                          "210px",
                        height:
                          "42px",
                        padding:
                          "0 14px 0 36px",
                        border:
                          "1px solid #dfe3eb",
                        borderRadius:
                          "10px",
                        outline:
                          "none",
                        fontSize:
                          "13px",
                        background:
                          "#ffffff",
                        boxSizing:
                          "border-box",
                      }}
                    />
                  </div>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      setShowAddStudent(
                        true
                      )
                    }
                  >
                    + Add Student
                  </button>
                </div>
              </div>

              {loadingStudents ? (
                <div className="empty-state">
                  Loading students...
                </div>
              ) : students.length ===
                0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <AppIcon name="students" size={28} />
                  </div>

                  <h3>
                    No students yet
                  </h3>

                  <p>
                    Add your first student
                    to get started.
                  </p>
                </div>
              ) : filteredStudents.length ===
                0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <AppIcon name="search" size={28} />
                  </div>

                  <h3>
                    No student found
                  </h3>

                  <p>
                    "{studentSearch}" naam ka
                    koi student nahi mila.
                  </p>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setStudentSearch("")
                    }
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Student
                        </th>

                        <th>
                          Parent
                        </th>

                        <th>
                          Batch
                        </th>

                        <th>
                          Monthly Fee
                        </th>

                        <th>
                          Contact
                        </th>

                        <th className="student-actions-heading">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudents.map(
                        (student) => (
                          <tr
                            key={
                              student.id
                            }
                          >
                            <td>
                              <div className="student-cell">
                                <div className="student-avatar">
                                  {student.name
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {
                                      student.name
                                    }
                                  </strong>

                                  <small>
                                    {student.joiningDate ||
                                      "No joining date"}
                                  </small>
                                </div>
                              </div>
                            </td>

                            <td>
                              {student.parentName ||
                                "—"}
                            </td>

                            <td>
                              <span className="batch-badge">
                                {
                                  student.batch
                                }
                              </span>
                            </td>

                            <td>
                              <strong>
                                ₹
                                {getMonthlyFee(
                                  student
                                )}
                              </strong>
                            </td>

                            <td>
                              <div className="action-row">
                                <button
                                  className="whatsapp-btn"
                                  onClick={() =>
                                    sendFeeReminder(
                                      student,
                                      selectedMonth
                                    )
                                  }
                                >
                                  WhatsApp
                                </button>

                                <button
                                  className="call-btn"
                                  onClick={() =>
                                    callParent(
                                      student.phone
                                    )
                                  }
                                >
                                  Call
                                </button>
                              </div>
                            </td>

                            <td className="student-actions-cell">
                              <div className="student-row-actions">
                                <button
                                  type="button"
                                  className="student-action-btn student-action-view"
                                  onClick={() =>
                                    openProfile(student)
                                  }
                                >
                                  <AppIcon name="profile" size={15} />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  className="student-action-btn student-action-study"
                                  onClick={() =>
                                    openStudyReport(student)
                                  }
                                >
                                  <AppIcon name="book" size={15} />
                                  <span>Study Report</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* =====================================================
              ATTENDANCE SECTION
          ===================================================== */}

          {activeSection ===
            "attendance" && (
            <section className="section-card">

              <div
                className="section-header"
                style={{
                  alignItems:
                    "center",
                }}
              >
                <div>
                  <span className="section-kicker">
                    ATTENDANCE
                  </span>

                  <h2>
                    Daily Attendance
                  </h2>

                  <p>
                    Mark attendance for all
                    your students.
                  </p>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "10px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <span
                      style={{
                        position:
                          "absolute",
                        left:
                          "12px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        fontSize:
                          "15px",
                        color:
                          "#98a2b3",
                        pointerEvents:
                          "none",
                      }}
                    >
                      <AppIcon name="search" size={16} />
                    </span>

                    <input
                      type="text"
                      placeholder="Search student..."
                      value={
                        attendanceSearch
                      }
                      onChange={(e) =>
                        setAttendanceSearch(
                          e.target.value
                        )
                      }
                      style={{
                        width:
                          "210px",
                        height:
                          "42px",
                        padding:
                          "0 14px 0 36px",
                        border:
                          "1px solid #dfe3eb",
                        borderRadius:
                          "10px",
                        outline:
                          "none",
                        fontSize:
                          "13px",
                        background:
                          "#ffffff",
                        boxSizing:
                          "border-box",
                      }}
                    />
                  </div>

                  <input
                    className="date-input"
                    type="date"
                    value={
                      attendanceDate
                    }
                    onChange={(e) =>
                      setAttendanceDate(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {students.length ===
              0 ? (
                <div className="empty-state">
                  Add students first to
                  mark attendance.
                </div>
              ) : filteredAttendanceStudents.length ===
                0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <AppIcon name="search" size={28} />
                  </div>

                  <h3>
                    No student found
                  </h3>

                  <p>
                    "{attendanceSearch}" naam ka
                    koi student nahi mila.
                  </p>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setAttendanceSearch("")
                    }
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="attendance-list">
                  {filteredAttendanceStudents.map(
                    (student) => {
                      const status =
                        attendance[
                          student.id
                        ]?.status

                      return (
                        <div
                          className="attendance-row"
                          key={
                            student.id
                          }
                        >
                          <div className="student-cell">
                            <div className="student-avatar small">
                              {student.name
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {
                                  student.name
                                }
                              </strong>

                              <small>
                                {
                                  student.batch
                                }
                              </small>
                            </div>
                          </div>

                          <div className="attendance-actions">
                            <button
                              className={`present ${
                                status ===
                                "Present"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                markAttendance(
                                  student,
                                  "Present"
                                )
                              }
                            >
                              <AppIcon name="present" size={14} /> Present
                            </button>

                            <button
                              className={`absent ${
                                status ===
                                "Absent"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                markAttendance(
                                  student,
                                  "Absent"
                                )
                              }
                            >
                              <AppIcon name="absent" size={14} /> Absent
                            </button>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            </section>
          )}

          {/* =====================================================
              FEES SECTION
          ===================================================== */}

          {activeSection ===
            "fees" && (
            <section className="section-card">

              <div
                className="section-header"
                style={{
                  alignItems:
                    "center",
                }}
              >
                <div>
                  <span className="section-kicker">
                    FEES MANAGEMENT
                  </span>

                  <h2>
                    Monthly Fees
                  </h2>

                  <p>
                    Manage payments,
                    reminders, WhatsApp
                    and parent calls.
                  </p>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "10px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <span
                      style={{
                        position:
                          "absolute",
                        left:
                          "12px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        fontSize:
                          "15px",
                        color:
                          "#98a2b3",
                        pointerEvents:
                          "none",
                      }}
                    >
                      <AppIcon name="search" size={16} />
                    </span>

                    <input
                      type="text"
                      placeholder="Search student..."
                      value={
                        feesSearch
                      }
                      onChange={(e) =>
                        setFeesSearch(
                          e.target.value
                        )
                      }
                      style={{
                        width:
                          "210px",
                        height:
                          "42px",
                        padding:
                          "0 14px 0 36px",
                        border:
                          "1px solid #dfe3eb",
                        borderRadius:
                          "10px",
                        outline:
                          "none",
                        fontSize:
                          "13px",
                        background:
                          "#ffffff",
                        boxSizing:
                          "border-box",
                      }}
                    />
                  </div>

                  <input
                    className="month-input"
                    type="month"
                    value={
                      selectedMonth
                    }
                    onChange={(e) =>
                      setSelectedMonth(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {students.length ===
              0 ? (
                <div className="empty-state">
                  Add students first to
                  manage fees.
                </div>
              ) : filteredFeesStudents.length ===
                0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <AppIcon name="search" size={28} />
                  </div>

                  <h3>
                    No student found
                  </h3>

                  <p>
                    "{feesSearch}" naam ka
                    koi student nahi mila.
                  </p>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setFeesSearch("")
                    }
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="fee-list">
                  {filteredFeesStudents.map(
                    (student) => {
                      const ledger =
                        getStudentFeeLedger(
                          student,
                          selectedMonth
                        )

                      const paid =
                        ledger
                          ? getFeePaid(
                              ledger
                            )
                          : 0

                      const balance =
                        ledger
                          ? getFeeBalance(
                              ledger
                            )
                          : 0

                      const status =
                        getFeeStatus(
                          ledger
                        )

                      return (
                        <div
                          className="fee-row"
                          key={
                            student.id
                          }
                        >
                          <div className="fee-student">
                            <div className="student-avatar small">
                              {student.name
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {
                                  student.name
                                }
                              </strong>

                              <small>
                                {
                                  student.parentName ||
                                  "Parent"
                                }
                              </small>
                            </div>
                          </div>

                          <div className="fee-info">
                            <span>
                              Fee: ₹
                              {ledger?.charge ??
                                getMonthlyFee(
                                  student
                                )}
                            </span>

                            <span className="paid-text">
                              Paid: ₹
                              {paid}
                            </span>

                            <span
                              className={
                                balance >
                                0
                                  ? "pending-text"
                                  : "paid-text"
                              }
                            >
                              {balance >
                              0
                                ? `Pending: ₹${balance}`
                                : "No Pending"}
                            </span>

                            <span
                              className={`fee-status ${status
                                .toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )}`}
                            >
                              {status}
                            </span>
                          </div>

                          <div className="fee-actions">

                            {!ledger && (
                              <button
                                className="primary-btn small-btn"
                                onClick={() =>
                                  createFeeRecord(
                                    student
                                  )
                                }
                              >
                                Create Fee
                              </button>
                            )}

                            {ledger && (
                              <button
                                className="secondary-btn small-btn"
                                onClick={() =>
                                  openPayment(
                                    student
                                  )
                                }
                              >
                                + Payment
                              </button>
                            )}

                            {ledger &&
                              balance >
                                0 && (
                                <>
                                  <button
                                    className="whatsapp-btn"
                                    onClick={() =>
                                      sendFeeReminder(
                                        student,
                                        selectedMonth
                                      )
                                    }
                                  >
                                    WhatsApp
                                  </button>

                                  <button
                                    className="call-btn"
                                    onClick={() =>
                                      callParent(
                                        student.phone
                                      )
                                    }
                                  >
                                    Call
                                  </button>
                                </>
                              )}

                            {ledger &&
                              balance <=
                                0 && (
                                <button
                                  className="call-btn"
                                  onClick={() =>
                                    callParent(
                                      student.phone
                                    )
                                  }
                                >
                                  Call
                                </button>
                              )}

                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            </section>
          )}

          {/* =====================================================
              TEACHER PROFILE / COACHING SETTINGS
          ===================================================== */}
          {activeSection === "profile-settings" && (
            <section className="section-card">
              <div className="section-header" style={{ alignItems: "center" }}>
                <div>
                  <span className="section-kicker">TEACHER PROFILE</span>
                  <h2>Teacher Profile & Coaching Settings</h2>
                  <p>Update your coaching details. These details are saved to your teacher account.</p>
                </div>
                <div className="welcome-icon"><AppIcon name="profile" size={26} /></div>
              </div>

              <form onSubmit={saveTeacherProfile} style={{ marginTop: "22px" }}>
                <div className="profile-settings-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                  <div className="form-group">
                    <label>Teacher Name</label>
                    <input type="text" placeholder="e.g. Anand Kumar" value={teacherProfileForm.teacherName} onChange={(e) => setTeacherProfileForm((prev) => ({ ...prev, teacherName: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Coaching / Institution Name *</label>
                    <input type="text" placeholder="e.g. Anand Academy" value={teacherProfileForm.coachingName} onChange={(e) => setTeacherProfileForm((prev) => ({ ...prev, coachingName: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input type="tel" placeholder="e.g. 9876543210" value={teacherProfileForm.phone} onChange={(e) => setTeacherProfileForm((prev) => ({ ...prev, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" placeholder="e.g. Bhagalpur" value={teacherProfileForm.city} onChange={(e) => setTeacherProfileForm((prev) => ({ ...prev, city: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Coaching Address</label>
                    <input type="text" placeholder="Enter complete coaching address" value={teacherProfileForm.address} onChange={(e) => setTeacherProfileForm((prev) => ({ ...prev, address: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Coaching Tagline</label>
                    <input type="text" placeholder="e.g. Learn Better. Achieve More." value={teacherProfileForm.tagline} onChange={(e) => setTeacherProfileForm((prev) => ({ ...prev, tagline: e.target.value }))} />
                    <small style={{ color: "#98a2b3", marginTop: "6px", display: "block" }}>Optional. Use this as your coaching's short introduction.</small>
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Login Email</label>
                    <input type="email" value={user.email || ""} readOnly style={{ background: "#f7f8fc", color: "#667085" }} />
                    <small style={{ color: "#98a2b3", marginTop: "6px", display: "block" }}>This is your Firebase login email and cannot be changed here.</small>
                  </div>
                </div>

                <div className="profile-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
                  <button type="button" className="secondary-btn" onClick={() => loadTeacherProfile(user.uid)} disabled={profileSaving}>Reset Changes</button>
                  <button type="submit" className="primary-btn" disabled={profileSaving}>{profileSaving ? "Saving..." : "Save Profile & Settings"}</button>
                </div>
              </form>
            </section>
          )}

          {/* =====================================================
              MONTHLY REPORT SECTION
          ===================================================== */}
          {activeSection === "monthly-report" && (
            <section className="section-card">
              <div className="section-header" style={{ alignItems: "center" }}>
                <div>
                  <span className="section-kicker">MONTHLY REPORT</span>
                  <h2>Fee Collection Report</h2>
                  <p>Monthly collection, pending amount and student-wise fee status.</p>
                </div>
                <div className="report-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    className="month-input"
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                  />
                  <button className="secondary-btn report-print-btn" onClick={() => window.print()}>
                    <AppIcon name="print" size={15} /> Print Report
                  </button>
                </div>
              </div>

              <div className="report-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px", marginTop: "20px" }}>
                <div className="report-stat-card"><span>Total Expected</span><strong>₹{reportTotalExpected.toLocaleString("en-IN")}</strong></div>
                <div className="report-stat-card"><span>Total Collected</span><strong>₹{reportTotalCollected.toLocaleString("en-IN")}</strong></div>
                <div className="report-stat-card"><span>Total Pending</span><strong>₹{reportTotalPending.toLocaleString("en-IN")}</strong></div>
                <div className="report-stat-card"><span>Collection Rate</span><strong>{reportCollectionPercent}%</strong></div>
              </div>

              <div className="report-status-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "12px" }}>
                <div className="report-status-card"><span>Paid / Advance</span><strong>{reportPaidCount}</strong></div>
                <div className="report-status-card"><span>Partial</span><strong>{reportPartialCount}</strong></div>
                <div className="report-status-card"><span>Pending</span><strong>{reportPendingCount}</strong></div>
              </div>

              <div className="report-progress-wrap" style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <strong>{getMonthName(reportMonth)} Collection</strong>
                  <span>{reportCollectionPercent}%</span>
                </div>
                <div style={{ height: "9px", background: "#eef1f6", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${reportCollectionPercent}%`, height: "100%", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "999px" }} />
                </div>
              </div>

              {students.length === 0 ? (
                <div className="empty-state" style={{ marginTop: "20px" }}>
                  <div className="empty-icon"><AppIcon name="report" size={28} /></div>
                  <h3>No students yet</h3>
                  <p>Add students to generate the monthly fee report.</p>
                </div>
              ) : (
                <div className="table-wrap report-table-wrap" style={{ marginTop: "20px" }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Student</th><th>Batch</th><th>Monthly Fee</th><th>Collected</th><th>Pending</th><th>Status</th><th>Report</th></tr>
                    </thead>
                    <tbody>
                      {monthlyReportRows.map((row) => (
                        <tr key={row.student.id}>
                          <td><strong>{row.student.name}</strong></td>
                          <td>{row.student.batch || "—"}</td>
                          <td>₹{row.expected.toLocaleString("en-IN")}</td>
                          <td>₹{row.paid.toLocaleString("en-IN")}</td>
                          <td>₹{row.pending.toLocaleString("en-IN")}</td>
                          <td><span className={`report-status ${getReportStatusClass(row.status)}`}>{row.status}</span></td>
                          <td>
                            <button className="secondary-btn" onClick={() => printStudentMonthlyReport(row)}><AppIcon name="print" size={15} /> Print</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          <footer className="app-legal-footer" style={{ marginTop: "22px", padding: "18px 8px 4px", borderTop: "1px solid #e7eaf0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ color: "#98a2b3", fontSize: "11px" }}>© {new Date().getFullYear()} Tuition Teacher Manager</span>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                {Object.entries(legalPages).map(([key, item]) => (
                  <button key={key} type="button" onClick={() => setLegalPage(key)} style={{ border: 0, background: "transparent", color: "#667085", cursor: "pointer", fontSize: "11px", padding: 0 }}>{item.title}</button>
                ))}
              </div>
            </div>
          </footer>

        </main>
      </div>

      {/* =====================================================
          ADD STUDENT MODAL
      ===================================================== */}

      {showAddStudent && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowAddStudent(false)
          }
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="section-kicker">
                  STUDENT
                </span>

                <h2>
                  Add Student
                </h2>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowAddStudent(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={addStudent}>
              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Student Name *
                  </label>

                  <input
                    name="name"
                    value={
                      studentForm.name
                    }
                    onChange={
                      handleStudentFormChange
                    }
                    placeholder="Student name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Parent Name
                  </label>

                  <input
                    name="parentName"
                    value={
                      studentForm.parentName
                    }
                    onChange={
                      handleStudentFormChange
                    }
                    placeholder="Parent name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Parent Phone *
                  </label>

                  <input
                    name="phone"
                    value={
                      studentForm.phone
                    }
                    onChange={
                      handleStudentFormChange
                    }
                    placeholder="10 digit number"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Batch *
                  </label>

                  <input
                    name="batch"
                    value={
                      studentForm.batch
                    }
                    onChange={
                      handleStudentFormChange
                    }
                    placeholder="e.g. Class 10 A"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Monthly Fee *
                  </label>

                  <input
                    type="number"
                    name="fee"
                    value={
                      studentForm.fee
                    }
                    onChange={
                      handleStudentFormChange
                    }
                    placeholder="₹5000"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Discount
                  </label>

                  <input
                    type="number"
                    name="discount"
                    value={
                      studentForm.discount
                    }
                    onChange={
                      handleStudentFormChange
                    }
                    placeholder="₹0"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Joining Date
                  </label>

                  <input
                    type="date"
                    name="joiningDate"
                    value={
                      studentForm.joiningDate
                    }
                    onChange={
                      handleStudentFormChange
                    }
                  />
                </div>

              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setShowAddStudent(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}

      {showProfile &&
        selectedStudent && (
          <div
            className="modal-overlay"
            onClick={() =>
              setShowProfile(false)
            }
          >
            <div
              className="modal large-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <span className="section-kicker">
                    STUDENT PROFILE
                  </span>

                  <h2>
                    {
                      selectedStudent.name
                    }
                  </h2>
                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setShowProfile(false)
                  }
                >
                  ×
                </button>
              </div>

              <div className="profile-details">

                <div className="profile-item">
                  <span>
                    Parent
                  </span>

                  <strong>
                    {selectedStudent.parentName ||
                      "—"}
                  </strong>
                </div>

                <div className="profile-item">
                  <span>
                    Phone
                  </span>

                  <strong>
                    {
                      selectedStudent.phone
                    }
                  </strong>
                </div>

                <div className="profile-item">
                  <span>
                    Batch
                  </span>

                  <strong>
                    {
                      selectedStudent.batch
                    }
                  </strong>
                </div>

                <div className="profile-item">
                  <span>
                    Monthly Fee
                  </span>

                  <strong>
                    ₹
                    {getMonthlyFee(
                      selectedStudent
                    )}
                  </strong>
                </div>

                <div className="profile-item">
                  <span>
                    Joining Date
                  </span>

                  <strong>
                    {selectedStudent.joiningDate ||
                      "—"}
                  </strong>
                </div>

              </div>

              <div className="profile-actions">

                <button
                  className="primary-btn"
                  onClick={() =>
                    openEditStudent(
                      selectedStudent
                    )
                  }
                >
                  Edit Profile
                </button>

                <button
                  type="button"
                  className="secondary-btn profile-action-btn"
                  onClick={() =>
                    sendFeeReminder(
                      selectedStudent,
                      selectedMonth
                    )
                  }
                >
                  <AppIcon name="fees" size={15} />
                  <span>Fee WhatsApp</span>
                </button>

                <button
                  type="button"
                  className="call-btn profile-action-btn"
                  onClick={() =>
                    callParent(
                      selectedStudent.phone
                    )
                  }
                >
                  <AppIcon name="profile" size={15} />
                  <span>Call Parent</span>
                </button>

                <button
                  type="button"
                  className="danger-btn profile-action-btn profile-delete-btn"
                  onClick={() =>
                    deleteStudent(
                      selectedStudent
                    )
                  }
                >
                  <AppIcon name="warning" size={15} />
                  <span>Delete Student</span>
                </button>

              </div>

              <div className="ledger-section">

                <div className="ledger-heading">
                  <div>
                    <span className="section-kicker">
                      PAYMENT HISTORY
                    </span>

                    <h3>
                      Fee Ledger
                    </h3>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      openPayment(
                        selectedStudent
                      )
                    }
                  >
                    + Record Payment
                  </button>
                </div>

                {(
                  selectedStudent.feeLedger ||
                  []
                ).length ===
                0 ? (
                  <div className="no-payments">
                    No fee records available.
                  </div>
                ) : (
                  <div className="ledger-list">
                    {(
                      selectedStudent.feeLedger ||
                      []
                    )
                      .slice()
                      .sort(
                        (a, b) =>
                          b.month.localeCompare(
                            a.month
                          )
                      )
                      .map(
                        (ledger) => (
                          <div
                            className="ledger-card"
                            key={
                              ledger.month
                            }
                          >
                            <div className="ledger-top">
                              <div>
                                <strong>
                                  {getMonthName(
                                    ledger.month
                                  )}
                                </strong>

                                <span>
                                  Fee: ₹
                                  {
                                    ledger.charge
                                  }
                                </span>
                              </div>

                              <div>
                                <span
                                  className={`fee-status ${getFeeStatus(
                                    ledger
                                  )
                                    .toLowerCase()
                                    .replace(
                                      " ",
                                      "-"
                                    )}`}
                                >
                                  {getFeeStatus(
                                    ledger
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="ledger-summary">
                              <span>
                                Paid: ₹
                                {getFeePaid(
                                  ledger
                                )}
                              </span>

                              <span>
                                Balance: ₹
                                {Math.max(
                                  0,
                                  getFeeBalance(
                                    ledger
                                  )
                                )}
                              </span>
                            </div>

                            <div className="payment-history">
                              {ledger.payments
                                ?.length ? (
                                ledger.payments.map(
                                  (
                                    payment
                                  ) => (
                                    <div
                                      className="payment-item"
                                      key={
                                        payment.id
                                      }
                                    >
                                      <div>
                                        <strong>
                                          ₹
                                          {
                                            payment.amount
                                          }
                                        </strong>

                                        <span>
                                          {
                                            payment.mode
                                          }{" "}
                                          •{" "}
                                          {new Date(
                                            payment.date
                                          ).toLocaleDateString(
                                            "en-IN"
                                          )}
                                        </span>
                                      </div>

                                      {payment.reversed ? (
                                        <span className="reversed-label">
                                          Reversed
                                        </span>
                                      ) : (
                                        <button
                                          className="danger-small-btn"
                                          onClick={() =>
                                            reversePayment(
                                              selectedStudent,
                                              ledger.month,
                                              payment.id
                                            )
                                          }
                                        >
                                          Reverse
                                        </button>
                                      )}
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="no-payments">
                                  No payments recorded.
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          STUDY REPORT MODAL
      ===================================================== */}

      {showStudyReport && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowStudyReport(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="section-kicker">STUDENT STUDY REPORT</span>
                <h2>{selectedStudent.name}</h2>
                <p style={{ margin: "5px 0 0", color: "#667085", fontSize: "13px" }}>
                  Notes, topics, homework, tests and academic progress.
                </p>
              </div>
              <button className="close-btn" onClick={() => setShowStudyReport(false)}>×</button>
            </div>

            <div className="profile-details">
              <div className="profile-item"><span>Parent</span><strong>{selectedStudent.parentName || "—"}</strong></div>
              <div className="profile-item"><span>Batch</span><strong>{selectedStudent.batch || "—"}</strong></div>
              <div className="profile-item"><span>Reports</span><strong>{Object.values(getStudyReport(selectedStudent)).slice(0,4).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0)}</strong></div>
            </div>

            <form onSubmit={saveStudyRecord} style={{ marginTop: "20px" }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Record Type</label>
                  <select name="type" value={studyRecordForm.type} onChange={handleStudyRecordChange}>
                    <option>Notes</option>
                    <option>Topic</option>
                    <option>Homework</option>
                    <option>Test</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={studyRecordForm.date} onChange={handleStudyRecordChange} />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input name="subject" placeholder="e.g. Mathematics" value={studyRecordForm.subject} onChange={handleStudyRecordChange} />
                </div>
                {studyRecordForm.type === "Test" && (
                  <div className="form-group">
                    <label>Test Name</label>
                    <input name="title" placeholder="e.g. Chapter 3 Test" value={studyRecordForm.title} onChange={handleStudyRecordChange} />
                  </div>
                )}
                {studyRecordForm.type === "Test" && (
                  <>
                    <div className="form-group"><label>Marks Obtained</label><input type="number" min="0" name="marks" value={studyRecordForm.marks} onChange={handleStudyRecordChange} placeholder="0" /></div>
                    <div className="form-group"><label>Total Marks</label><input type="number" min="0" name="totalMarks" value={studyRecordForm.totalMarks} onChange={handleStudyRecordChange} placeholder="100" /></div>
                  </>
                )}
                {studyRecordForm.type === "Homework" && (
                  <div className="form-group">
                    <label>Status</label>
                    <select name="homeworkStatus" value={studyRecordForm.homeworkStatus} onChange={handleStudyRecordChange}>
                      <option value="">Select status</option><option>Assigned</option><option>Completed</option><option>Pending</option><option>Reviewed</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{studyRecordForm.type === "Test" ? "Test Details / Remarks" : studyRecordForm.type === "Homework" ? "Homework Details" : studyRecordForm.type === "Topic" ? "Topic Covered" : "Notes / Class Work"}</label>
                <textarea name="content" rows="3" placeholder="Enter study details..." value={studyRecordForm.content} onChange={handleStudyRecordChange} />
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => sendStudyReportWhatsApp(selectedStudent)}>Share Report on WhatsApp</button>
                <button type="submit" className="primary-btn" disabled={studyReportSaving}>{studyReportSaving ? "Saving..." : `Add ${studyRecordForm.type}`}</button>
              </div>
            </form>

            <div className="ledger-section" style={{ marginTop: "22px" }}>
              <div className="ledger-heading"><div><span className="section-kicker">ACADEMIC RECORD</span><h3>Study History</h3></div></div>
              {(() => {
                const report = getStudyReport(selectedStudent)
                const allRecords = [
                  ...report.topics.map((item) => ({ ...item, type: "Topic" })),
                  ...report.notes.map((item) => ({ ...item, type: "Notes" })),
                  ...report.homework.map((item) => ({ ...item, type: "Homework" })),
                  ...report.tests.map((item) => ({ ...item, type: "Test" })),
                ].sort((a,b) => String(b.date).localeCompare(String(a.date)))
                return allRecords.length ? (
                  <div className="ledger-list">
                    {allRecords.map((item) => (
                      <div className="ledger-card" key={`${item.type}-${item.id}`}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                          <div>
                            <strong>{item.type}{item.title ? ` • ${item.title}` : ""}</strong>
                            <div style={{ color: "#667085", fontSize: "12px", marginTop: "4px" }}>{item.subject} • {item.date || "—"}</div>
                            <p style={{ margin: "8px 0 0", color: "#344054", fontSize: "13px", whiteSpace: "pre-wrap" }}>{item.content || "—"}</p>
                            {item.type === "Test" && <strong style={{ display: "block", marginTop: "6px" }}>Score: {item.marks}/{item.totalMarks || "—"}</strong>}
                            {item.type === "Homework" && <span style={{ display: "inline-block", marginTop: "6px", fontSize: "12px", fontWeight: "700" }}>{item.status || "Assigned"}</span>}
                          </div>
                          <button className="danger-btn" style={{ padding: "7px 10px" }} onClick={() => deleteStudyRecord(selectedStudent, item.type, item.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="no-payments">No study records added yet.</div>
              })()}
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label>Teacher Remarks / Overall Progress</label>
              <textarea rows="3" value={studyRemarks} onChange={(e) => setStudyRemarks(e.target.value)} placeholder="Add overall progress, strengths, areas to improve, next steps..." />
              <button className="secondary-btn" style={{ marginTop: "10px" }} onClick={async () => {
                try {
                  const updatedReport = { ...getStudyReport(selectedStudent), remarks: studyRemarks.trim(), updatedAt: new Date().toISOString() }
                  await updateDoc(doc(db, "students", selectedStudent.id), { studyReport: updatedReport })
                  const updatedStudent = { ...selectedStudent, studyReport: updatedReport }
                  setStudents((prev) => prev.map((item) => item.id === selectedStudent.id ? updatedStudent : item))
                  setSelectedStudent(updatedStudent)
                  alert("Teacher remarks saved.")
                } catch (error) { console.error(error); alert("Remarks save nahi ho paaye.") }
              }}>Save Remarks</button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT STUDENT MODAL
      ===================================================== */}

      {showEditStudent &&
        selectedStudent && (
          <div
            className="modal-overlay"
            onClick={() =>
              setShowEditStudent(false)
            }
          >
            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <span className="section-kicker">
                    PROFILE
                  </span>

                  <h2>
                    Edit Student
                  </h2>
                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setShowEditStudent(false)
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={updateStudent}
              >
                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Student Name *
                    </label>

                    <input
                      value={
                        editForm.name
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Parent Name
                    </label>

                    <input
                      value={
                        editForm.parentName
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          parentName:
                            e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Parent Phone *
                    </label>

                    <input
                      value={
                        editForm.phone
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          phone:
                            e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Batch *
                    </label>

                    <input
                      value={
                        editForm.batch
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          batch:
                            e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Monthly Fee *
                    </label>

                    <input
                      type="number"
                      value={
                        editForm.fee
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          fee:
                            e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Discount
                    </label>

                    <input
                      type="number"
                      value={
                        editForm.discount
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          discount:
                            e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Joining Date
                    </label>

                    <input
                      type="date"
                      value={
                        editForm.joiningDate
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          joiningDate:
                            e.target.value,
                        })
                      }
                    />
                  </div>

                </div>

                <div className="modal-actions">

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setShowEditStudent(
                        false
                      )
                      setShowProfile(
                        true
                      )
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    Save Changes
                  </button>

                </div>
              </form>
            </div>
          </div>
        )}

      {/* =====================================================
          PAYMENT MODAL
      ===================================================== */}

      {showPayment &&
        selectedStudent && (
          <div
            className="modal-overlay"
            onClick={() =>
              setShowPayment(false)
            }
          >
            <div
              className="modal payment-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <span className="section-kicker">
                    PAYMENT
                  </span>

                  <h2>
                    Record Payment
                  </h2>
                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setShowPayment(false)
                  }
                >
                  ×
                </button>
              </div>

              {(() => {
                const ledger =
                  getStudentFeeLedger(
                    selectedStudent,
                    selectedMonth
                  )

                return (
                  <>
                    <div className="payment-summary">

                      <div>
                        <span>
                          Student
                        </span>

                        <strong>
                          {
                            selectedStudent.name
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Month
                        </span>

                        <strong>
                          {getMonthName(
                            selectedMonth
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Pending
                        </span>

                        <strong className="pending-text">
                          ₹
                          {Math.max(
                            0,
                            getFeeBalance(
                              ledger
                            )
                          )}
                        </strong>
                      </div>

                    </div>

                    <form
                      onSubmit={
                        recordPayment
                      }
                    >
                      <div className="form-group">
                        <label>
                          Payment Amount
                        </label>

                        <input
                          type="number"
                          value={
                            paymentAmount
                          }
                          onChange={(e) =>
                            setPaymentAmount(
                              e.target.value
                            )
                          }
                          placeholder="Enter amount"
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Payment Mode
                        </label>

                        <select
                          value={
                            paymentMode
                          }
                          onChange={(e) =>
                            setPaymentMode(
                              e.target.value
                            )
                          }
                        >
                          <option>
                            Cash
                          </option>

                          <option>
                            UPI
                          </option>

                          <option>
                            Bank Transfer
                          </option>

                          <option>
                            Card
                          </option>
                        </select>
                      </div>

                      <div className="modal-actions">

                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() =>
                            setShowPayment(
                              false
                            )
                          }
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="primary-btn"
                        >
                          Record Payment
                        </button>

                      </div>
                    </form>
                  </>
                )
              })()}
            </div>
          </div>
        )}

    </div>
  )
}

export default App