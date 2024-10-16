import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { IconButton } from '@mui/material';


function Info() {
  const location = useLocation();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editTopic, setEditTopic] = useState('');
  const [isAddingSubtopic, setIsAddingSubtopic] = useState(null);
  const [isAddingSubinsubtopic, setIsAddingSubinsubtopic] = useState(null);
  const [isAddingTable, setIsAddingTable] = useState({});
  const [tables, setTables] = useState({});
  const [selectedPLOs, setSelectedPLOs] = useState([]);
  const [newTableData, setNewTableData] = useState({});
  const [showTable, setShowTable] = useState({});

  const [newPLONumber, setNewPLONumber] = useState('');
  const [newPLODescription, setNewPLODescription] = useState('');
  const [cognitiveDomain, setCognitiveDomain] = useState('');
  const [psychomotorDomain, setPsychomotorDomain] = useState(false);
  const [affectiveDomain, setAffectiveDomain] = useState(false);

  const [allPLOs, setAllPLOs] = useState([]);

  const [isAddingCLO, setIsAddingCLO] = useState(false); // เปิด/ปิดฟอร์มเพิ่ม CLO
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedParentType, setSelectedParentType] = useState('topic');
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedGrandParentId, setSelectedGrandParentId] = useState(null);
  const [selectedGreatGrandParentId, setSelectedGreatGrandParentId] = useState(null);
  const [tableDataId, setTableDataId] = useState(null); // ID ของ TableData ที่เกี่ยวข้อง

  const [selectedSubjectCLOs, setSelectedSubjectCLOs] = useState([]);
  const [selectedSubjectPLOs, setSelectedSubjectPLOs] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);

  const [courseDescriptionTH, setCourseDescriptionTH] = useState('');
  const [courseDescriptionENG, setCourseDescriptionENG] = useState('');
  const [requiredSubjects, setRequiredSubjects] = useState('');
  const [conditions, setConditions] = useState('');
  const [gradeType, setGradeType] = useState('');

  const [showPLOSection, setShowPLOSection] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const facultyId = queryParams.get("faculty");
  const levelEduId = queryParams.get("levelEdu");
  const departmentId = queryParams.get("department");
  const courseYearId = queryParams.get("courseYear");

  const [faculty, setFaculty] = useState('');
  const [levelEdu, setLevelEdu] = useState('');
  const [department, setDepartment] = useState('');
  const [courseYear, setCourseYear] = useState('');

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
        // Define path for fetching Topics
        const topicsPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`;
        
        const topicCollection = collection(db, topicsPath);
        const topicSnapshot = await getDocs(topicCollection);
        
        let allCLOs = [];
        let allTableData = [];

        // Loop through all topics
        for (const topicDoc of topicSnapshot.docs) {
          const topicId = topicDoc.id;

          // Fetch TableData for each topic
          const tableDataCollection = collection(db, `${topicsPath}/${topicId}/TableData`);
          const tableDataSnapshot = await getDocs(tableDataCollection);
          const fetchedTableData = tableDataSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Fetch CLOs for each topic
          const cloCollection = collection(db, `${topicsPath}/${topicId}/CLOs`);
          const cloSnapshot = await getDocs(cloCollection);
          const fetchedCLOs = cloSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Fetch Subtopics for each topic
          const subtopicsCollection = collection(db, `${topicsPath}/${topicId}/Subtopics`);
          const subtopicSnapshot = await getDocs(subtopicsCollection);
          
          // Loop through all subtopics
          for (const subtopicDoc of subtopicSnapshot.docs) {
            const subtopicId = subtopicDoc.id;

            // Fetch TableData for each subtopic
            const subtopicTableDataCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/TableData`);
            const subtopicTableDataSnapshot = await getDocs(subtopicTableDataCollection);
            const fetchedSubtopicTableData = subtopicTableDataSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Fetch CLOs for each subtopic
            const subtopicCloCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/CLOs`);
            const subtopicCloSnapshot = await getDocs(subtopicCloCollection);
            const fetchedSubtopicCLOs = subtopicCloSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Fetch Subinsubtopics for each subtopic
            const subinsubtopicsCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics`);
            const subinsubtopicSnapshot = await getDocs(subinsubtopicsCollection);
            
            // Loop through all subinsubtopics
            for (const subinsubtopicDoc of subinsubtopicSnapshot.docs) {
              const subinsubtopicId = subinsubtopicDoc.id;

              // Fetch TableData for each subinsubtopic
              const subinsubtopicTableDataCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/TableData`);
              const subinsubtopicTableDataSnapshot = await getDocs(subinsubtopicTableDataCollection);
              const fetchedSubinsubtopicTableData = subinsubtopicTableDataSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));

              // Fetch CLOs for each subinsubtopic
              const subinsubtopicCloCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/CLOs`);
              const subinsubtopicCloSnapshot = await getDocs(subinsubtopicCloCollection);
              const fetchedSubinsubtopicCLOs = subinsubtopicCloSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              // รวมข้อมูล CLOs และ TableData ของ Subinsubtopic
              allTableData.push(...fetchedSubinsubtopicTableData);
              allCLOs.push(...fetchedSubinsubtopicCLOs);
            }

            // รวมข้อมูล CLOs และ TableData ของ Subtopic
            allTableData.push(...fetchedSubtopicTableData);
            allCLOs.push(...fetchedSubtopicCLOs);
          }

          // รวมข้อมูล CLOs และ TableData ของ Topic
          allTableData.push(...fetchedTableData);
          allCLOs.push(...fetchedCLOs);
        }

        // แสดงข้อมูล CLOs และ TableData ที่ดึงมา
        // console.log("Fetched all Table Data:", allTableData);
        // console.log("Fetched all CLOs:", allCLOs);

        // ตั้งค่า state สำหรับข้อมูลที่ถูกดึงทั้งหมด
        setTableData(allTableData);
        setCloData(allCLOs);
      } catch (error) {
        console.error("Error fetching all data: ", error);
      }
    };

    fetchAllCLOs();
  }, [facultyId, levelEduId, departmentId, courseYearId]); // เพิ่ม dependencies
  
  const handlePLOClick = (plo) => {
    console.log("Selected PLO ID:", plo.id); // ตรวจสอบค่า PLO ที่เลือก
  
    // กรอง CLOs ตาม TableData ที่เกี่ยวข้องกับ PLO ที่เลือก
    const relatedCLOs = cloData.filter((clo) => {
      console.log("CLO PLO ID:", clo.ploId); // แสดงค่า ploId ของ CLO เพื่อการตรวจสอบ
      return clo.ploId === plo.id; // กรอง CLO ที่มี ploId ตรงกับ PLO ที่เลือก
    });
  
    console.log("Filtered CLOs:", relatedCLOs); // แสดง CLOs ที่เกี่ยวข้อง
  
    setRelatedCLOs(relatedCLOs); // เก็บ CLOs ที่เกี่ยวข้องใน state
    setSelectPLO(plo); // เก็บ PLO ที่ถูกเลือก
    setIsModalOpen(true); // เปิด modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectPLO(null);
  };

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // สร้าง references สำหรับ collection และ documents
        const facultyDocRef = doc(db, `faculty/${facultyId}`);
        const levelEduDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}`);
        const departmentDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}`);
        const courseYearDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}`);
        
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
      console.error('One or more query parameters are missing.');
      setLoading(false);
      return;
    }

    const fetchPLOsall = async () => {
    try {
      const PLOCollectionRef = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`);
      const PLOsSnapshot = await getDocs(PLOCollectionRef);
      const PLOs = PLOsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setAllPLOs(PLOs);
    } catch (error) {
      console.error('Error fetching PLOs: ', error);
    }
    };


    const fetchData = async () => {
      try {
        const facultyDoc = await getDocs(collection(db, `faculty`), doc(db, `faculty/${facultyId}`));
        const levelEduDoc = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu`), doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}`));
        const departmentDoc = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department`), doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}`));
        const courseYearDoc = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear`), doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}`));
        
        const topicsCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`);
        const topicsSnapshot = await getDocs(topicsCollection);

        const topicsWithSubtopics = await Promise.all(
          topicsSnapshot.docs.map(async (topicDoc) => {
            const subtopicsCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics`);
            const subtopicsSnapshot = await getDocs(subtopicsCollection);
            const subtopics = subtopicsSnapshot.docs.map(subDoc => ({ ...subDoc.data(), id: subDoc.id }));
  
            const subtopicsWithSubinsubtopics = await Promise.all(
              subtopics.map(async (subtopic) => {
                const subinsubtopicsCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics`);
                const subinsubtopicsSnapshot = await getDocs(subinsubtopicsCollection);
                const subinsubtopics = subinsubtopicsSnapshot.docs.map(subinsubtopicDoc => ({ ...subinsubtopicDoc.data(), id: subinsubtopicDoc.id }));
  
                // Fetch TableData for Subinsubtopics
                const subinsubtopicTableData = await Promise.all(
                  subinsubtopics.map(async (subinsubtopic) => {
                    const tableDataCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics/${subinsubtopic.id}/TableData`);
                    const tableDataSnapshot = await getDocs(tableDataCollection);
                    const tables = tableDataSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    return { ...subinsubtopic, tables };
                  })
                );
  
                return { ...subtopic, subinsubtopics: subinsubtopicTableData };
              })
            );
  
            // Fetch TableData for Subtopics
            const subtopicTableData = await Promise.all(
              subtopicsWithSubinsubtopics.map(async (subtopic) => {
                const tableDataCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/TableData`);
                const tableDataSnapshot = await getDocs(tableDataCollection);
                const tables = tableDataSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                return { ...subtopic, tables };
              })
            );
  
            // Fetch TableData for Topics
            const tableDataCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/TableData`);
            const tableDataSnapshot = await getDocs(tableDataCollection);
            const tables = tableDataSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  
            return { ...topicDoc.data(), id: topicDoc.id, subtopics: subtopicTableData, tables };
          })
        );
        
        setData({
          faculty: facultyDoc.docs[0]?.data(),
          levelEdu: levelEduDoc.docs[0]?.data(),
          department: departmentDoc.docs[0]?.data(),
          courseYear: courseYearDoc.docs[0]?.data(),
        });

        setTopics(topicsWithSubtopics);
        fetchPLOs();

        setTopics(topicsWithSubtopics);

      } catch (error) {
        console.error('Error fetching data: ', error);
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

  // ฟังก์ชันเพิ่ม PLO
  const addPLO = async () => {
    if (!newPLONumber || !newPLODescription) {
      console.error('PLO number or description is missing.');
      return;
    }

    const newPLO = { 
      number: newPLONumber, 
      description: newPLODescription,
      cognitiveDomain,
      psychomotorDomain,
      affectiveDomain 
    };
    
    try {
      const PLOCollectionRef = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`);
      await addDoc(PLOCollectionRef, newPLO);

      const PLOSnapshot = await getDocs(PLOCollectionRef);
      const PLOs = PLOSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setData(prev => ({ ...prev, PLO: PLOs }));

      setNewPLONumber('');
      setNewPLODescription('');
      setCognitiveDomain('');
      setPsychomotorDomain(false);
      setAffectiveDomain(false);
    } catch (error) {
      console.error('Error adding PLO: ', error);
    }
  };

  // ฟังก์ชันดึงข้อมูล PLO
  const fetchPLOs = async () => {
    try {
      const PLOCollectionRef = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`);
      const PLOsSnapshot = await getDocs(PLOCollectionRef);
      const PLOs = PLOsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setData(prev => ({ ...prev, PLO: PLOs }));
    } catch (error) {
      console.error('Error fetching PLOs: ', error);
    }
  };

  const getPloById = async (ploId) => {
    try {
      if (!ploId) {
        console.log("Invalid ploId:", ploId); // เพิ่มการ log
        return null;
      }
  
      const ploDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`, ploId);
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
    parentType = "topic",
    grandParentId = null,
    greatGrandParentId = null
  ) => {
    console.log("tableId:", tableId)
    try {
      setSelectedSubjectCode(subjectCode);
      setSelectedSubjectId(parentId);
      setSelectedParentType(parentType);
      setSelectedParentId(parentId);
      setSelectedGrandParentId(grandParentId);
      setSelectedGreatGrandParentId(greatGrandParentId);
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
        // Set course details
        setCourseDescriptionTH(data.courseDescriptionTH || "");
        setCourseDescriptionENG(data.courseDescriptionENG || "");
        setRequiredSubjects(data.requiredSubjects || "");
        setConditions(data.conditions || "");
        setGradeType(data.gradeType || "");
  
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
            tableId,
            selectedSubjectCode: subjectCode,
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
  
  const togglePLOSectionVisibility = () => {
    setShowPLOSection((prevShow) => !prevShow);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="bg-gradient-to-b from-green-500 to-white h-screen">
      <div className='flex justify-center text-center'><h1 className='bg-green-400 text-white p-5 w-3/5'>Info Page</h1></div>
      <div className='flex justify-center'>
        <div className='h-full border border-black flex w-3/5 bg-white'>
          <div className='text-start border-black bg-white flex flex-col h-full items-center w-60'>
            <button className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full' onClick={() => window.history.back()}>ย้อนกลับ</button>
          </div>
          <div className='flex flex-col w-full'>
            <div className="border border-gray-400 rounded-lg">
              <div className="mt-0 ml-5 h-full">
                <h2 className="text-lg font-semibold text-gray-700">คณะ: {faculty}</h2>
                <h3 className="text-lg font-semibold text-gray-700">ระดับการศึกษา: {levelEdu}</h3>
                <h4 className="text-lg font-semibold text-gray-700">ภาควิชา: {department}</h4>
                <h5 className="text-lg font-semibold text-gray-700">หลักสูตรปี: {courseYear}</h5>
              </div>
            </div>
            <div className='mt-5'>
              <div className='border border-black'>
                {topics
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort topics by name in ascending order
                .map(topic => (
                  <div className='ml-8' key={topic.id}>
                    {isEditing === topic.id ? (
                      <>
                      </>
                    ) : (
                      <>
                        {topic.name}
                      </>
                    )}
                    {isAddingSubtopic === topic.id && (
                      <div>
                      </div>
                    )}

                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-1" onClick={() => toggleTableVisibility(topic.id)}>
                    {showTable[topic.id] ? (
                        <span>&lt;</span> // ไอคอนเปิด
                      ) : (
                        <span>&gt;</span> // ไอคอนปิด
                      )}
                    </button>

                    {showTable[topic.id] && (
                      <table>
                        <thead>
                        <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                            <th className='border border-black' >Subject Code</th>
                            <th className='border border-black' >Subject Name</th>
                            <th className='border border-black' >Credit</th>
                          </tr>
                        </thead>
                        <tbody>
                        {topics.map((topic) => (
                          topic.tables
                          .sort((a, b) => a.subjectCode.localeCompare(b.subjectCode))
                          .map((table, idx) => (
                            <tr key={idx}>
                              <td className='border border-black bg-yellow-100 cursor-pointer' onClick={() => handleSubjectClick(topic.id, table.id, table.subjectCode, 'topic')}>{table.subjectCode}</td>
                              <td className='border border-black bg-yellow-100'>{table.subjectNameENG}</td>
                              <td className='border border-black bg-yellow-100'>{table.credit}</td>
                            </tr>
                          ))
                        ))}
                        </tbody>
                      </table>
                    )}

                    {isAddingTable[topic.id] && (
                      <div>
                      </div>
                    )}

                    {topic.subtopics && topic.subtopics
                      .sort((a, b) => a.name.localeCompare(b.name)) // Sort subtopics by name in ascending order
                      .map(subtopic => (
                      <div className='ml-8' key={subtopic.id}>
                        {isEditing === subtopic.id ? (
                          <div>
                          </div>
                        ) : (
                          <div>
                            {subtopic.name}
                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-1" onClick={() => toggleTableVisibility(`${topic.id}-${subtopic.id}`)}>
                            {showTable[`${topic.id}-${subtopic.id}`] ? (
                              <span>&lt;</span> // ไอคอนเปิด
                            ) : (
                              <span>&gt;</span> // ไอคอนปิด
                            )}
                            </button>
                          </div>
                        )}
                        
                        {isAddingSubinsubtopic === subtopic.id && (
                          <div>
                          </div>
                        )}
                        {showTable[`${topic.id}-${subtopic.id}`] && (
                          <table>
                            <thead>
                              <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                                <th className='border border-black'>Subject Code</th>
                                <th className='border border-black'>Subject Name</th>
                                <th className='border border-black'>Credit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subtopic.tables
                              .sort((a, b) => a.subjectCode.localeCompare(b.subjectCode))
                              .map((table, idx) => (
                                <tr key={idx}>
                                  <td className='border border-black bg-yellow-100 cursor-pointer' onClick={() => handleSubjectClick(subtopic.id, table.id, table.subjectCode, 'subtopic', topic.id)}>{table.subjectCode}</td>
                                  <td className='border border-black bg-yellow-100'>{table.subjectNameENG}</td>
                                  <td className='border border-black bg-yellow-100'>{table.credit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {isAddingTable[`${topic.id}-${subtopic.id}`] && (
                          <div>
                          </div>
                        )}
                      
                        {subtopic.subinsubtopics && subtopic.subinsubtopics
                          .sort((a, b) => a.name.localeCompare(b.name)) // Sort subinsubtopics by name in ascending order
                          .map(subinsubtopic => (
                          <div className='ml-8' key={subinsubtopic.id}>

                            {isEditing === subinsubtopic.id ? (
                              <div>
                              </div>
                            ) : (
                              <div>
                                {subinsubtopic.name}
                                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-1" onClick={() => {console.log('run'),toggleTableVisibility(`${topic.id}-${subtopic.id}-${subinsubtopic.id}`)}}>
                                {showTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] ? (
                                  <span>&lt;</span> // ไอคอนเปิด
                                ) : (
                                  <span>&gt;</span> // ไอคอนปิด
                                )}
                                </button>

                                {showTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] && (
                                  <table>
                                    <thead>
                                      <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                                        <th className='border border-black'>Subject Code</th>
                                        <th className='border border-black'>Subject Name</th>
                                        <th className='border border-black'>Credit</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subinsubtopic.tables
                                      .sort((a, b) => a.subjectCode.localeCompare(b.subjectCode))
                                      .map((table, idx) => (
                                          <tr key={idx}>
                                            <td className='border border-black bg-yellow-100 cursor-pointer' onClick={() => handleSubjectClick(subinsubtopic.id, table.id, table.subjectCode, 'subinsubtopic', subtopic.id, topic.id)}>{table.subjectCode}</td>
                                            <td className='border border-black bg-yellow-100'>{table.subjectNameENG}</td>
                                            <td className='border border-black bg-yellow-100'>{table.credit}</td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                )}
                                {isAddingTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] && (
                                  <div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
                  <div>
                    {/* {selectedSubjectCode && (
                      <div className='bg-lime-300'>
                        <h3 className='bg-lime-100'>Course Details for {selectedSubjectCode}</h3>
                          <ul>
                            <li><strong>Course Description (TH):</strong> {courseDescriptionTH}</li>
                            <li><strong>Course Description (ENG):</strong> {courseDescriptionENG}</li>
                            <li><strong>Required Subjects:</strong> {requiredSubjects}</li>
                            <li><strong>Conditions:</strong> {conditions}</li>
                            <li><strong>Grade Type:</strong> {gradeType}</li>
                          </ul>
                        <h3>CLOs for {selectedSubjectCode}</h3>
                        <ul className='bg-green-400'>
                        {selectedSubjectCLOs
                          .filter(clo => clo.tableDataId === tableDataId)
                          .map((clo, index) => (
                            <li key={index}>
                              <strong>Name:</strong> {clo.name}, <strong>Description:</strong> {clo.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )} */}
                    </div>
                  </div>
                  <div>
                  <h2 className='text-center'>
                    <span className="bg-green-500 text-white">PLOs</span>
                  </h2>
                  <table>
                        <thead>
                          <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                            <th className='border border-black'>ลำดับ</th>
                            <th className='border border-black'>ผลลัพธ์การเรียนรู้ที่คาดหวังของหลักสูตร (PLOs)</th>
                            <th className='border border-black'>Cognitive Domain </th>
                            <th className='border border-black'>Psychomotor Domain (Skills)</th>
                            <th className='border border-black'>Affective Domain (Attitude)</th>
                          </tr>
                        </thead>
                        <tbody>
                        {data.PLO &&
                          data.PLO.sort((a, b) => a.number - b.number).map(
                            (plo, index) => (
                              <tr key={index}>
                                <td
                                  className="text-center border border-black cursor-pointer"
                                  onClick={() => handlePLOClick(plo)}
                                >
                                  PLO{plo.number}
                                </td>
                                <td
                                  className="border border-black cursor-pointer"
                                  onClick={() => handlePLOClick(plo)}
                                >
                                  {plo.description}
                                </td>
                                <td className="text-center border border-black">
                                  {plo.cognitiveDomain}
                                </td>
                                <td className="text-center border border-black">
                                  {plo.psychomotorDomain ? "✔" : ""}
                                </td>
                                <td className="text-center border border-black">
                                  {plo.affectiveDomain ? "✔" : ""}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                      {isModalOpen && selectPLO && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                          <h3 className="text-xl font-bold">CLOs for PLO {selectPLO.number}</h3>
                          {tableData.filter(tableDataItem => 
                            relatedCLOs.some(clo => clo.tableDataId === tableDataItem.id) // กรองเฉพาะ TableData ที่มี CLO
                          ).map((tableDataItem) => (
                            <div key={tableDataItem.id} className="mb-4">
                              <h4 className="font-semibold">{tableDataItem.subjectNameTH}</h4> 
                              <ul>
                                {relatedCLOs.filter((clo) => clo.tableDataId === tableDataItem.id) // ใช้ relatedCLOs ในการกรอง CLOs ตาม TableData ID
                                  .map((clo) => (
                                    <li key={clo.id} className="border-b py-2">
                                      <strong>{clo.name}</strong>: {clo.description}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ))}
                          {tableData.filter(tableDataItem => 
                            relatedCLOs.some(clo => clo.tableDataId === tableDataItem.id) // ตรวจสอบการกรองให้แน่ใจว่าไม่มีวิชาที่ไม่มี CLO
                          ).length === 0 && (
                            <p>ไม่มีวิชาที่มี CLO ที่เกี่ยวข้อง</p>
                          )}
                          <button
                            onClick={closeModal}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                          >
                            ปิด
                          </button>
                        </div>
                      </div>
                    )}
                      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded" onClick={togglePLOSectionVisibility}>
                        {showPLOSection ? 'Hide PLOs' : 'Show PLOs'}
                      </button>

                      {showPLOSection && (
                        <>
                          {data.PLO && data.PLO.map((plo, index) => (
                            <div key={index} className='border border-black bg-slate-200'>
                              <strong>{plo.number}:</strong>
                              <p className='w-full max-w-lg overflow-hidden text-ellipsis whitespace-normal h-auto'>{plo.description}</p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

export default Info;