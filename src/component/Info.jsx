import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import { IconButton } from "@mui/material";

function Info() {
  const location = useLocation();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [showTable, setShowTable] = useState({});

  const [newPLONumber, setNewPLONumber] = useState("");
  const [newPLODescription, setNewPLODescription] = useState("");
  const [cognitiveDomain, setCognitiveDomain] = useState("");
  const [psychomotorDomain, setPsychomotorDomain] = useState(false);
  const [affectiveDomain, setAffectiveDomain] = useState(false);

  const [allPLOs, setAllPLOs] = useState([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedParentType, setSelectedParentType] = useState("topic");
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedGrandParentId, setSelectedGrandParentId] = useState(null);
  const [selectedGreatGrandParentId, setSelectedGreatGrandParentId] =
    useState(null);
  const [selectedGreatGreatGrandParentId, setSelectedGreatGreatGrandParentId] = useState(null);
  const [tableDataId, setTableDataId] = useState(null); // ID ของ TableData ที่เกี่ยวข้อง

  const [showPLOSection, setShowPLOSection] = useState(false);
  const [selectedSubjectPLOs, setSelectedSubjectPLOs] = useState([]);
  const [selectedSubjectCLOs, setSelectedSubjectCLOs] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const facultyId = queryParams.get("faculty");
  const levelEduId = queryParams.get("levelEdu");
  const departmentId = queryParams.get("department");
  const courseYearId = queryParams.get("courseYear");

  const [faculty, setFaculty] = useState("");
  const [levelEdu, setLevelEdu] = useState("");
  const [department, setDepartment] = useState("");
  const [courseYear, setCourseYear] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectPLO, setSelectPLO] = useState(null);
  const [relatedCLOs, setRelatedCLOs] = useState([]);

  const [cloData, setCloData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Fetch CLO data
  useEffect(() => {
    const fetchAllCLOs = async () => {
      if (!facultyId || !levelEduId || !departmentId || !courseYearId) {
        console.warn("One of the required IDs is not defined");
        return; // ออกจากฟังก์ชันถ้าไม่มีค่า ID
      }
  
      try {
        const topicsPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`;
  
        const topicCollection = collection(db, topicsPath);
        const topicSnapshot = await getDocs(topicCollection);
  
        let allCLOs = [];
        let allTableData = [];
  
        for (const topicDoc of topicSnapshot.docs) {
          const topicId = topicDoc.id;
  
          const tableDataCollection = collection(
            db,
            `${topicsPath}/${topicId}/TableData`
          );
          const tableDataSnapshot = await getDocs(tableDataCollection);
          const fetchedTableData = tableDataSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            parentTypeP: "topic",
            parentIdP: topicId, // Add parentId for reference
            grandParentIdP: null, // Add grandParentId for reference
            greatGrandParentId: null, // Add greatGrandParentId
            greatGreatGrandParentId: null
          }));
  
          const cloCollection = collection(db, `${topicsPath}/${topicId}/CLOs`);
          const cloSnapshot = await getDocs(cloCollection);
          const fetchedCLOs = cloSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          const subtopicsCollection = collection(
            db,
            `${topicsPath}/${topicId}/Subtopics`
          );
          const subtopicSnapshot = await getDocs(subtopicsCollection);
  
          for (const subtopicDoc of subtopicSnapshot.docs) {
            const subtopicId = subtopicDoc.id;
  
            const subtopicTableDataCollection = collection(
              db,
              `${topicsPath}/${topicId}/Subtopics/${subtopicId}/TableData`
            );
            const subtopicTableDataSnapshot = await getDocs(
              subtopicTableDataCollection
            );
            const fetchedSubtopicTableData = subtopicTableDataSnapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
                parentTypeP: "subtopic",
                parentIdP: subtopicId,  // Add parentId
                grandParentIdP: topicId, // Add grandParentId for reference
                greatGrandParentId: null, // Add greatGrandParentId
                greatGreatGrandParentId: null
              })
            );
  
            const subtopicCloCollection = collection(
              db,
              `${topicsPath}/${topicId}/Subtopics/${subtopicId}/CLOs`
            );
            const subtopicCloSnapshot = await getDocs(subtopicCloCollection);
            const fetchedSubtopicCLOs = subtopicCloSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
  
            const subinsubtopicsCollection = collection(
              db,
              `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics`
            );
            const subinsubtopicSnapshot = await getDocs(
              subinsubtopicsCollection
            );
  
            for (const subinsubtopicDoc of subinsubtopicSnapshot.docs) {
              const subinsubtopicId = subinsubtopicDoc.id;
  
              const subinsubtopicTableDataCollection = collection(
                db,
                `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/TableData`
              );
              const subinsubtopicTableDataSnapshot = await getDocs(
                subinsubtopicTableDataCollection
              );
              const fetchedSubinsubtopicTableData =
                subinsubtopicTableDataSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  parentType: "subinsubtopic",
                  parentId: subinsubtopicId,  // Add parentId
                  grandParentId: subtopicId,  // Add grandParentId
                  greatGrandParentId: topicId, // Add greatGrandParentId
                  greatGreatGrandParentId: null
                }));
  
              const subinsubtopicCloCollection = collection(
                db,
                `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/CLOs`
              );
              const subinsubtopicCloSnapshot = await getDocs(
                subinsubtopicCloCollection
              );
              const fetchedSubinsubtopicCLOs = subinsubtopicCloSnapshot.docs.map(
                (doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })
              );
  
              // เพิ่ม fetch สำหรับ subsubinsubtopics
              const subsubinsubtopicsCollection = collection(
                db,
                `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/Subsubinsubtopics`
              );
              const subsubinsubtopicSnapshot = await getDocs(
                subsubinsubtopicsCollection
              );
  
              for (const subsubinsubtopicDoc of subsubinsubtopicSnapshot.docs) {
                const subsubinsubtopicId = subsubinsubtopicDoc.id;
  
                // Fetch TableData for subsubinsubtopics
                const subsubinsubtopicTableDataCollection = collection(
                  db,
                  `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/Subsubinsubtopics/${subsubinsubtopicId}/TableData`
                );
                const subsubinsubtopicTableDataSnapshot = await getDocs(
                  subsubinsubtopicTableDataCollection
                );
                const fetchedSubsubinsubtopicTableData =
                  subsubinsubtopicTableDataSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    parentType: "subsubinsubtopic",
                    parentId: subsubinsubtopicId,  // Add parentId
                    grandParentId: subinsubtopicId,  // Add grandParentId
                    greatGrandParentId: subtopicId, // Add greatGrandParentId
                    greatGreatGrandParentId: topicId

                  }));
  
                // Fetch CLOs for subsubinsubtopics
                const subsubinsubtopicCloCollection = collection(
                  db,
                  `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/Subsubinsubtopics/${subsubinsubtopicId}/CLOs`
                );
                const subsubinsubtopicCloSnapshot = await getDocs(
                  subsubinsubtopicCloCollection
                );
                const fetchedSubsubinsubtopicCLOs =
                  subsubinsubtopicCloSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                  }));
  
                allTableData.push(...fetchedSubsubinsubtopicTableData);
                allCLOs.push(...fetchedSubsubinsubtopicCLOs);
              }
  
              allTableData.push(...fetchedSubinsubtopicTableData);
              allCLOs.push(...fetchedSubinsubtopicCLOs);
            }
  
            allTableData.push(...fetchedSubtopicTableData);
            allCLOs.push(...fetchedSubtopicCLOs);
          }
  
          allTableData.push(...fetchedTableData);
          allCLOs.push(...fetchedCLOs);
        }
  
        setTableData(allTableData);
        console.log(allTableData)
        setCloData(allCLOs);
      } catch (error) {
        console.error("Error fetching all data: ", error);
      }
    };

    fetchAllCLOs();
  }, [facultyId, levelEduId, departmentId, courseYearId]);
  // เพิ่ม dependencies

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // สร้าง references สำหรับ collection และ documents
        const facultyDocRef = doc(db, `faculty/${facultyId}`);
        const levelEduDocRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}`
        );
        const departmentDocRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}`
        );
        const courseYearDocRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}`
        );

        // ดึงข้อมูลจาก Firestore
        const facultyData = await getDoc(facultyDocRef);
        const levelEduData = await getDoc(levelEduDocRef);
        const departmentData = await getDoc(departmentDocRef);
        const courseYearData = await getDoc(courseYearDocRef);

        // อัปเดต state ด้วยข้อมูลที่ได้
        if (facultyData.exists()) {
          setFaculty(facultyData.data().Faculty);
        } else {
          // console.log("No such document in faculty!");
        }

        if (levelEduData.exists()) {
          setLevelEdu(levelEduData.data().level);
        } else {
          // console.log("No such document in levelEdu!");
        }

        if (departmentData.exists()) {
          setDepartment(departmentData.data().DepartName);
        } else {
          // console.log("No such document in department!");
        }

        if (courseYearData.exists()) {
          setCourseYear(courseYearData.data().CourseYear);
        } else {
          // console.log("No such document in courseYear!");
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [facultyId, levelEduId, departmentId, courseYearId]);

  useEffect(() => {
    if (!facultyId || !levelEduId || !departmentId || !courseYearId) {
      console.error("One or more query parameters are missing.");
      setLoading(false);
      return;
    }

    const fetchPLOsall = async () => {
      try {
        const PLOCollectionRef = collection(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`
        );
        const PLOsSnapshot = await getDocs(PLOCollectionRef);
        const PLOs = PLOsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setAllPLOs(PLOs);
      } catch (error) {
        console.error("Error fetching PLOs: ", error);
      }
    };

    const fetchData = async () => {
      try {
        // Fetching faculty, levelEdu, department, courseYear as before
        const facultyDoc = await getDocs(
          collection(db, `faculty`),
          doc(db, `faculty/${facultyId}`)
        );
        const levelEduDoc = await getDocs(
          collection(db, `faculty/${facultyId}/LevelEdu`),
          doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}`)
        );
        const departmentDoc = await getDocs(
          collection(
            db,
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department`
          ),
          doc(
            db,
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}`
          )
        );
        const courseYearDoc = await getDocs(
          collection(
            db,
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear`
          ),
          doc(
            db,
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}`
          )
        );

        // Fetching Topics and Subtopics as before
        const topicsCollection = collection(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`
        );
        const topicsSnapshot = await getDocs(topicsCollection);

        const topicsWithSubtopics = await Promise.all(
          topicsSnapshot.docs.map(async (topicDoc) => {
            // Fetching Subtopics
            const subtopicsCollection = collection(
              db,
              `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics`
            );
            const subtopicsSnapshot = await getDocs(subtopicsCollection);
            const subtopics = subtopicsSnapshot.docs.map((subDoc) => ({
              ...subDoc.data(),
              id: subDoc.id,
            }));

            // Fetch Subinsubtopics and TableData for Subinsubtopics
            const subtopicsWithSubinsubtopics = await Promise.all(
              subtopics.map(async (subtopic) => {
                const subinsubtopicsCollection = collection(
                  db,
                  `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics`
                );
                const subinsubtopicsSnapshot = await getDocs(
                  subinsubtopicsCollection
                );
                const subinsubtopics = subinsubtopicsSnapshot.docs.map(
                  (subinsubtopicDoc) => ({
                    ...subinsubtopicDoc.data(),
                    id: subinsubtopicDoc.id,
                  })
                );

                // Fetch TableData for Subinsubtopics
                const subinsubtopicTableData = await Promise.all(
                  subinsubtopics.map(async (subinsubtopic) => {
                    const tableDataCollection = collection(
                      db,
                      `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics/${subinsubtopic.id}/TableData`
                    );
                    const tableDataSnapshot = await getDocs(
                      tableDataCollection
                    );
                    const tables = tableDataSnapshot.docs.map((doc) => ({
                      ...doc.data(),
                      id: doc.id,
                    }));

                    // Fetch Subsubinsubtopics and TableData for Subsubinsubtopics
                    const subsubinsubtopicsCollection = collection(
                      db,
                      `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics/${subinsubtopic.id}/Subsubinsubtopics`
                    );
                    const subsubinsubtopicsSnapshot = await getDocs(
                      subsubinsubtopicsCollection
                    );
                    const subsubinsubtopics =
                      subsubinsubtopicsSnapshot.docs.map(
                        (subsubinsubtopicDoc) => ({
                          ...subsubinsubtopicDoc.data(),
                          id: subsubinsubtopicDoc.id,
                        })
                      );

                    // Fetch TableData for Subsubinsubtopics
                    const subsubinsubtopicTableData = await Promise.all(
                      subsubinsubtopics.map(async (subsubinsubtopic) => {
                        const tableDataCollection = collection(
                          db,
                          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics/${subinsubtopic.id}/Subsubinsubtopics/${subsubinsubtopic.id}/TableData`
                        );
                        const tableDataSnapshot = await getDocs(
                          tableDataCollection
                        );
                        const tables = tableDataSnapshot.docs.map((doc) => ({
                          ...doc.data(),
                          id: doc.id,
                        }));
                        return { ...subsubinsubtopic, tables };
                      })
                    );

                    return {
                      ...subinsubtopic,
                      tables, // TableData for subinsubtopic
                      subsubinsubtopics: subsubinsubtopicTableData,
                    };
                  })
                );

                return {
                  ...subtopic,
                  subinsubtopics: subinsubtopicTableData,
                };
              })
            );

            // Fetch TableData for Subtopics
            const subtopicTableData = await Promise.all(
              subtopicsWithSubinsubtopics.map(async (subtopic) => {
                const tableDataCollection = collection(
                  db,
                  `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/TableData`
                );
                const tableDataSnapshot = await getDocs(tableDataCollection);
                const tables = tableDataSnapshot.docs.map((doc) => ({
                  ...doc.data(),
                  id: doc.id,
                }));
                return { ...subtopic, tables };
              })
            );

            // Fetch TableData for Topics
            const tableDataCollection = collection(
              db,
              `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/TableData`
            );
            const tableDataSnapshot = await getDocs(tableDataCollection);
            const tables = tableDataSnapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));

            return {
              ...topicDoc.data(),
              id: topicDoc.id,
              subtopics: subtopicTableData,
              tables,
            };
          })
        );

        // Set state with fetched data
        setData({
          faculty: facultyDoc.docs[0]?.data(),
          levelEdu: levelEduDoc.docs[0]?.data(),
          department: departmentDoc.docs[0]?.data(),
          courseYear: courseYearDoc.docs[0]?.data(),
        });

        setTopics(topicsWithSubtopics);
        fetchPLOs();
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPLOsall();
    fetchData();
  }, [facultyId, levelEduId, departmentId, courseYearId]);

  const toggleTableVisibility = (key) => {
    setShowTable((prevShowTable) => ({
      ...prevShowTable,
      [key]: !prevShowTable[key],
    }));
  };

  // ฟังก์ชันดึงข้อมูล PLO
  const fetchPLOs = async () => {
    try {
      const PLOCollectionRef = collection(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`
      );
      const PLOsSnapshot = await getDocs(PLOCollectionRef);
      const PLOs = PLOsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setData((prev) => ({ ...prev, PLO: PLOs }));
    } catch (error) {
      console.error("Error fetching PLOs: ", error);
    }
  };

  const getPloById = async (ploId) => {
    try {
      if (!ploId) {
        console.log("Invalid ploId:", ploId); // เพิ่มการ log
        return null;
      }

      const ploDocRef = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`,
        ploId
      );
      const ploDoc = await getDoc(ploDocRef);
      

      if (ploDoc.exists()) {
        //console.log("PLO found:", ploDoc.data()); // เพิ่มการ log เพื่อตรวจสอบข้อมูลที่ได้มา
        return ploDoc.data(); // ดึงข้อมูล PLO
      } else {
        console.log("PLO not found for ploId:", ploId);
        return null;
      }
    } catch (error) {
      console.error("Error fetching PLO:", error);
      return null;
    }
  };

  // ส่วนกดlink
  const handleSubjectClick = async (
    parentId,
    tableId,
    subjectCode,
    subjectNameTH,
    subjectNameENG,
    parentType = "topic",
    grandParentId = null,
    greatGrandParentId = null,
    greatGreatGrandParentId = null // เพิ่ม parameter สำหรับ greatGreatGrandParentId
  ) => {
    console.log(
      "tableId:",
      tableId,
      "subjectNameTH:",
      subjectNameTH,
      "subjectNameENG:",
      subjectNameENG
    );
    try {
      setSelectedSubjectCode(subjectCode);
      setSelectedSubjectId(parentId);
      setSelectedParentType(parentType);
      setSelectedParentId(parentId);
      setSelectedGrandParentId(grandParentId);
      setSelectedGreatGrandParentId(greatGrandParentId);
      setSelectedGreatGreatGrandParentId(greatGreatGrandParentId); // เก็บ greatGreatGrandParentId
      setTableDataId(tableId); // เก็บ TableDataID ที่เกี่ยวข้อง
  
      let docRef;
      // สร้าง docRef ตาม parentType
      if (parentType === "topic") {
        docRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/TableData/${tableId}`
        );
      } else if (parentType === "subtopic") {
        docRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/TableData/${tableId}`
        );
      } else if (parentType === "subinsubtopic") {
        docRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/TableData/${tableId}`
        );
      } else if (parentType === "subsubinsubtopic") {
        docRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGreatGrandParentId}/Subtopics/${greatGrandParentId}/Subinsubtopics/${grandParentId}/Subsubinsubtopics/${parentId}/TableData/${tableId}`
        );
      }
  
      // ดึงข้อมูล TableData
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const ploIds = data.PLOs || [];
  
        // Map PLO IDs to their detailed information using allPLOs
        const ploDetails = ploIds.map((ploId) => {
          const plo = allPLOs.find((p) => p.id === ploId);
          return plo
            ? plo
            : {
                id: ploId,
                number: "Unknown",
                description: "No description available",
              };
        });
  
        setSelectedSubjectPLOs(ploDetails);
  
        // Fetch CLO data (ถ้าต้องการ)
        let cloPaths = [];
        if (parentType === "topic") {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/CLOs`,
          ];
        } else if (parentType === "subtopic") {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/CLOs`,
          ];
        } else if (parentType === "subinsubtopic") {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/CLOs`,
          ];
        } else if (parentType === "subsubinsubtopic") {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGreatGrandParentId}/Subtopics/${greatGrandParentId}/Subinsubtopics/${grandParentId}/Subsubinsubtopics/${parentId}/CLOs`,
          ];
        }
  
        // Fetch CLO data from the appropriate path (ถ้าต้องการ)
        const cloData = [];
        for (const path of cloPaths) {
          const cloCollection = collection(db, path);
          const cloSnapshot = await getDocs(cloCollection);
  
          if (!cloSnapshot.empty) {
            cloSnapshot.forEach((doc) => {
              cloData.push({ id: doc.id, ...doc.data() });
            });
          }
        }
  
        setSelectedSubjectCLOs(cloData);
  
        // สร้าง updatedCLOs ที่รวม PLOs
        const updatedCLOs = await Promise.all(
          cloData.map(async (clo) => {
            const plo = await getPloById(clo.ploId);
            return {
              ...clo,
              ploNumber: plo ? plo.number : "Unknown",
              ploDescription: plo ? plo.description : "Unknown",
            };
          })
        );
  
        navigate(`/course-detailsuser/${subjectCode}`, {
          state: {
            facultyId,
            levelEduId,
            departmentId,
            courseYearId,
            parentType,
            parentId,
            grandParentId,
            greatGrandParentId,
            greatGreatGrandParentId, // เพิ่ม greatGreatGrandParentId
            tableId,
            selectedSubjectCode: subjectCode,
            subjectNameTH, // เพิ่มตัวแปร subjectNameTH
            subjectNameENG, // เพิ่มตัวแปร subjectNameENG
            closWithPLOs: updatedCLOs,
          },
        });
  
      } else {
        console.log("No such document!");
        setSelectedSubjectPLOs([]);
        setSelectedSubjectCLOs([]);
      }
    } catch (error) {
      console.error("Error fetching PLOs and CLOs for subject: ", error);
      setSelectedSubjectPLOs([]);
      setSelectedSubjectCLOs([]);
    }
  };

  const [closWithPLOs, setClosWithPLOs] = useState([]);

  useEffect(() => {
    //console.log("updatedCLOs with PLO data:", closWithPLOs); // ตรวจสอบค่า
  }, [closWithPLOs]);

  useEffect(() => {
    const fetchPLOsForCLOs = async () => {
      const updatedCLOs = await Promise.all(
        selectedSubjectCLOs
          .filter((clo) => clo.tableDataId === tableDataId)
          .map(async (clo) => {
            const ploIds = Array.isArray(clo.ploId) ? clo.ploId : [clo.ploId];
            console.log("กำลังดึง PLO สำหรับ CLO:", clo);

            const ploDataList = await Promise.all(
              ploIds.map(async (id) => {
                const plo = await getPloById(id);
                // console.log("PLO ที่ดึงมา:", plo);
                return plo ? plo : { number: "Unknown", description: "Unknown" };
              })
            );

            // console.log("PLO Data List สำหรับ CLO:", ploDataList);
            // const plo = await getPloById(clo.ploId);
            // console.log("PLO fetched:", plo);

            return {
              ...clo,
              ploData: ploDataList, // เก็บข้อมูล PLO หลายตัวในรูปแบบ array

              // ...clo,
              // ploNumber: plo ? plo.number : "Unknown", // เพิ่มการตรวจสอบว่า PLO มีข้อมูลหรือไม่
              // ploDescription: plo ? plo.description : "Unknown",
            };
          })
      );

      //console.log("Updated CLOs with PLO data:", updatedCLOs); // ตรวจสอบข้อมูลหลังการอัพเดต

      setClosWithPLOs(updatedCLOs);
    };

    fetchPLOsForCLOs();
  }, [selectedSubjectCLOs, tableDataId]);

  const goToPLOPage = () => {
    // Pass only serializable data like objects or arrays, not functions
    console.log("check", facultyId, levelEduId, departmentId, courseYearId);
    navigate("/plosuser", {
      state: {
        facultyId,
        levelEduId,
        departmentId,
        courseYearId,
        data,
        tableData,
        cloData,
      },
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="bg-gradient-to-b from-green-500 to-white min-h-screen p-10">
      <div className="flex justify-center text-center mb-8">
        <h1 className="bg-green-400 p-6 w-3/5 rounded-lg shadow-lg text-3xl font-bold">
          Info Page
        </h1>
      </div>
      <div className="flex justify-center">
        <div className="h-full w-3/5 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex w-full">
            <div className="bg-gray-100 w-60 p-4 flex flex-col items-center space-y-4 border-r border-gray-300">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg w-full shadow transition duration-200"
                onClick={() => window.history.back()}
              >
                ย้อนกลับ
              </button>
            </div>
            <div className="flex flex-col w-full p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">
                  คณะ: {faculty}
                </h2>
                <h3 className="text-xl font-semibold text-gray-800">
                  ระดับการศึกษา: {levelEdu}
                </h3>
                <h4 className="text-xl font-semibold text-gray-800">
                  ภาควิชา: {department}
                </h4>
                <h5 className="text-xl font-semibold text-gray-800">
                  หลักสูตรปี: {courseYear}
                </h5>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-md space-y-4">
                {topics
                  .sort((a, b) => a.name.localeCompare(b.name)) // Sort topics by name in ascending order
                  .map((topic) => (
                    <div className="ml-8 mt-2" key={topic.id}>
                      {topic.name}
                      <button
                        class="hover:bg-blue-700 font-bold py-1 px-1 border border-blue-700 rounded ml-1 w-8"
                        onClick={() => toggleTableVisibility(topic.id)}
                      >
                        {showTable[topic.id] ? (
                          <span>...</span> // ไอคอนเปิด
                        ) : (
                          <span>...</span> // ไอคอนปิด
                        )}
                      </button>

                      {showTable[topic.id] && (
                        <table>
                          <thead>
                            <tr className="bg-slate-500 border-black border-gray-200 text-white">
                              <th className="border border-black">
                                รหัสวิชา
                              </th>
                              <th className="border border-black">
                                ชื่อวิชา
                              </th>
                              <th className="border border-black">หน่วยกิต</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topics.map((topic) =>
                              topic.tables
                                .sort((a, b) =>
                                  a.subjectCode.localeCompare(b.subjectCode)
                                )
                                .map((table, idx) => (
                                  <tr key={idx}>
                                    <td
                                      className="border border-black bg-yellow-100 cursor-pointer"
                                      onClick={() =>
                                        handleSubjectClick(
                                          topic.id,
                                          table.id,
                                          table.subjectCode,
                                          table.subjectNameTH,
                                          table.subjectNameENG,
                                          "topic"
                                        )
                                      }
                                    >
                                      {table.subjectCode}
                                    </td>
                                    <td className="border border-black bg-yellow-100">
                                      {table.subjectNameENG}
                                    </td>
                                    <td className="border border-black bg-yellow-100">
                                      {table.credit}
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      )}
                      {topic.subtopics &&
                        topic.subtopics
                          .sort((a, b) => a.name.localeCompare(b.name)) // Sort subtopics by name in ascending order
                          .map((subtopic) => (
                            <div className="ml-8 mt-1" key={subtopic.id}>
                              <div>
                                {subtopic.name}
                                <button
                                  class="hover:bg-blue-700 font-bold py-1 px-1 border border-blue-700 rounded ml-1 w-8"
                                  onClick={() =>
                                    toggleTableVisibility(
                                      `${topic.id}-${subtopic.id}`
                                    )
                                  }
                                >
                                  {showTable[`${topic.id}-${subtopic.id}`] ? (
                                    <span>...</span> // ไอคอนเปิด
                                  ) : (
                                    <span>...</span> // ไอคอนปิด
                                  )}
                                </button>
                              </div>
                              {showTable[`${topic.id}-${subtopic.id}`] && (
                                <table>
                                  <thead>
                                    <tr className="bg-slate-500 border-black border-gray-200 text-white">
                                      <th className="border border-black">
                                        รหัสวิชา
                                      </th>
                                      <th className="border border-black">
                                        ชื่อวิชา
                                      </th>
                                      <th className="border border-black">
                                        หน่วยกิต
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {subtopic.tables
                                      .sort((a, b) =>
                                        a.subjectCode.localeCompare(
                                          b.subjectCode
                                        )
                                      )
                                      .map((table, idx) => (
                                        <tr key={idx}>
                                          <td
                                            className="border border-black bg-yellow-100 cursor-pointer"
                                            onClick={() =>
                                              handleSubjectClick(
                                                subtopic.id,
                                                table.id,
                                                table.subjectCode,
                                                table.subjectNameTH,
                                                table.subjectNameENG,
                                                "subtopic",
                                                topic.id
                                              )
                                            }
                                          >
                                            {table.subjectCode}
                                          </td>
                                          <td className="border border-black bg-yellow-100">
                                            {table.subjectNameENG}
                                          </td>
                                          <td className="border border-black bg-yellow-100">
                                            {table.credit}
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              )}
                              {subtopic.subinsubtopics &&
                                subtopic.subinsubtopics
                                  .sort((a, b) => a.name.localeCompare(b.name)) // Sort subinsubtopics by name in ascending order
                                  .map((subinsubtopic) => (
                                    <div
                                      className="ml-8 mt-1"
                                      key={subinsubtopic.id}
                                    >
                                      <div>
                                        {subinsubtopic.name}
                                        <button
                                          class="hover:bg-blue-700 font-bold py-1 px-1 border border-blue-700 rounded ml-1 w-8"
                                          onClick={() => {
                                            toggleTableVisibility(
                                              `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                            );
                                          }}
                                        >
                                          {showTable[
                                            `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                          ] ? (
                                            <span>...</span> // ไอคอนเปิด
                                          ) : (
                                            <span>...</span> // ไอคอนปิด
                                          )}
                                        </button>

                                        {showTable[
                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                        ] && (
                                          <table>
                                            <thead>
                                              <tr className="bg-slate-500 border-black border-gray-200 text-white">
                                                <th className="border border-black">
                                                  รหัสวิชา
                                                </th>
                                                <th className="border border-black">
                                                  ชื่อวิชา
                                                </th>
                                                <th className="border border-black">
                                                  หน่วยกิต
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {subinsubtopic.tables &&
                                              subinsubtopic.tables.length >
                                                0 ? (
                                                <>
                                                  {console.log(
                                                    "Subinsubtopic Tables:",
                                                    subinsubtopic.tables
                                                  )}
                                                  {subinsubtopic.tables
                                                    .sort((a, b) =>
                                                      a.subjectCode.localeCompare(
                                                        b.subjectCode
                                                      )
                                                    )
                                                    .map((table, idx) => (
                                                      <tr key={idx}>
                                                        <td
                                                          className="border border-black bg-yellow-100 cursor-pointer"
                                                          onClick={() =>
                                                            handleSubjectClick(
                                                              subinsubtopic.id,
                                                              table.id,
                                                              table.subjectCode,
                                                              table.subjectNameTH,
                                                              table.subjectNameENG,
                                                              "subinsubtopic",
                                                              subtopic.id,
                                                              topic.id
                                                            )
                                                          }
                                                        >
                                                          {table.subjectCode}
                                                        </td>
                                                        <td className="border border-black bg-yellow-100">
                                                          {table.subjectNameENG}
                                                        </td>
                                                        <td className="border border-black bg-yellow-100">
                                                          {table.credit}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                </>
                                              ) : (
                                                <tr>
                                                  <td colSpan="3">
                                                    No table data available
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </table>
                                        )}
                                        {subinsubtopic.subsubinsubtopics &&
                                          subinsubtopic.subsubinsubtopics
                                            .sort((a, b) =>
                                              a.name.localeCompare(b.name)
                                            )
                                            .map((subsubinsubtopic) => (
                                              <div
                                                className="ml-8 mt-2"
                                                key={subsubinsubtopic.id}
                                              >
                                                <div>
                                                  {subsubinsubtopic.name}
                                                  <button
                                                    className="hover:bg-blue-700 font-bold py-1 px-1 border border-blue-700 rounded ml-2 w-8"
                                                    onClick={() =>
                                                      toggleTableVisibility(
                                                        `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                      )
                                                    }
                                                  >
                                                    {showTable[
                                                      `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                    ] ? (
                                                      <span>...</span> // ไอคอนเปิด
                                                    ) : (
                                                      <span>...</span> // ไอคอนปิด
                                                    )}
                                                  </button>
                                                </div>

                                                {showTable[
                                                  `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                ] && (
                                                  <table className="mt-3 border border-gray-300 rounded-md">
                                                    <thead>
                                                      <tr className="bg-slate-500 text-white">
                                                        <th className="border border-black">
                                                          รหัสวิชา
                                                        </th>
                                                        <th className="border border-black">
                                                          ชื่อวิชา
                                                        </th>
                                                        <th className="border border-black">
                                                          หน่วยกิต
                                                        </th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {subsubinsubtopic.tables
                                                        .sort((a, b) =>
                                                          a.subjectCode.localeCompare(
                                                            b.subjectCode
                                                          )
                                                        )
                                                        .map((table, idx) => (
                                                          <tr key={idx}>
                                                            <td className="border border-black bg-yellow-100">
                                                              <span
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                  handleSubjectClick(
                                                                    subsubinsubtopic.id,
                                                                    table.id,
                                                                    table.subjectCode,
                                                                    table.subjectNameTH,
                                                                    table.subjectNameENG,
                                                                    "subsubinsubtopic",
                                                                    subinsubtopic.id,
                                                                    subtopic.id,
                                                                    topic.id
                                                                  )
                                                                }
                                                              >
                                                                {
                                                                  table.subjectCode
                                                                }
                                                              </span>
                                                            </td>
                                                            <td className="border border-black bg-yellow-100">
                                                              {
                                                                table.subjectNameENG
                                                              }
                                                            </td>
                                                            <td className="border border-black bg-yellow-100">
                                                              {table.credit}
                                                            </td>
                                                          </tr>
                                                        ))}
                                                    </tbody>
                                                  </table>
                                                )}
                                              </div>
                                            ))}
                                      </div>
                                    </div>
                                  ))}
                            </div>
                          ))}
                    </div>
                  ))}
              </div>
              <div>
              <button
                  onClick={goToPLOPage}
                  className="bg-blue-500 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 items-center justify-center"
                >
                  ดู PLOs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Info;
