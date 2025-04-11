const employeeData = require("../../employeeData");
const EmployeeController = require("./employeeController");
const DepartmentController = require("./departmentController");
const AttendanceController = require("./attendanceController");
const DesignationController = require("./designationController");
const DeviceController = require("./DeviceController");
const AreaController = require("./areaController");
const pool = require("../config/Pdb");


module.exports = function (app) {
  app.get("/iclock/cdata", async function (req, res) {
    if (req.query.options = "ALL") {
      const result = await DeviceController.getDeviceBySerialNumber1(req.query.SN);
      let timeZone = "+4:30";  
      if (result) {
        timeZone = result.time_zone;
      }
      res.setHeader("Content-Type", "text/plain");

      var text = 
      "GET OPTION FROM: " + req.query.SN +
      "\nTransFlag=TransData AttLog\tOpLog\tAttPhoto\tEnrollFP\tEnrollUser\tFPImag\tChgUser\tChgFP\tFACE\tUserPic\tFVEIN\tBioPhoto" +
      "\nServerVer=2.4.1" +
      "\nPushProtVer=2.4.1" +
      "\nEncrypt=0" +
      "\nEncryptFlag=1000000000" +
      "\nSupportPing=1" +
      "\nPushOptionsFlag=1" +
      "\nMaxPostSize=1048576" +
    "\nPushOptions=UserCount, TransactionCount, FingerFunOn, FPVersion, FPCount, FaceFunOn, FaceVersion, FaceCount, FvFunOn, FvVersion, FvCount, PvFunOn, PvVersion, PvCount, BioPhotoFun, BioDataFun, PhotoFunOn, ~LockFunOn, CardProtFormat, ~Platform, MultiBioPhotoSupport, MultiBioDataSupport, MultiBioVersion" +
       "\nMultiBioDataSupport=0:1:1:0:0:0:0:1:1:1" +
       "\nMultiBioPhotoSupport=0:0:0:0:0:0:0:0:0:1" +
       "\nTimeZone=" + timeZone +
      "\nTransTimes=00:00;14:05" +
      "\nTransInterval=1" +
      "\nErrorDelay=60" +
      "\nDelay=10" +
      "\nRealtime=1" +
      "\nStamp=1674389708" +
      "\nOpStamp=1674423154" +
      "\nPhotoStamp=0";

      res.setHeader('Content-Type', 'text/plain');

      const contentLength = Buffer.byteLength(text, 'utf8');
      res.setHeader('Content-Length', contentLength);
  
      res.send(text);
    
    }
      
});

  app.get("/iclock/getrequest", async function (req, res) {
    console.log(req.query.SN);  
    const now = new Date().toISOString();
    const sn =req.query.SN;
    const result = await DeviceController.getDeviceBySerialNumber1(req.query.SN);
   if (result) {
    await pool.query(
        `INSERT INTO device_info (serial_number, status, last_seen)
         VALUES ($1, $2, $3)
         ON CONFLICT (serial_number)
         DO UPDATE SET status = $2, last_seen = $3`,
        [req.query.SN, true,  new Date().toISOString()]
    );
}

    if (req.query && Object.keys(req.query).some((key) => key.includes("INFO"))) {

      console.log("INFO REQUEST");
        const { SN, INFO } = req.query;
        const infoArray = INFO.split(',');

        const deviceInfo = {
            firmwareVersion: infoArray[0],
            enrolledUsers: parseInt(infoArray[1], 10),
            fingerprints: parseInt(infoArray[2], 10),
            attendanceRecords: parseInt(infoArray[3], 10),
            deviceIP: infoArray[4],
            fingerprintVersion: parseInt(infoArray[5], 10),
            faceVersion: parseInt(infoArray[6], 10),
            faceTemplatesCount: parseInt(infoArray[7], 10),
            devSupportData: parseInt(infoArray[8], 10),
        };

        // Update device info
        await DeviceController.updateDeviceInfo(SN, deviceInfo);
    }

    const lastDevice = await employeeData.getLastUpdatedDevice();

    if (lastDevice !== null) {
      
        const result = await DeviceController.getDeviceBySerialNumber1(lastDevice.serial_number);
        if (result && req.query.SN === result.serial_number) {
            // Handle attendance data sync
            if (result.attendance_sync && !result.attendance_command_sent) {
                const cmd = "C:" + 4000 + ":DATA QUERY ATTLOG StartTime=" +
                    new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T').join(' ').substring(0, 19) +
                    "\tEndTime=" +
                    new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T').join(' ').substring(0, 19);

                await DeviceController.markAttendanceCommandSent(result.serial_number);
                return res.send(cmd);
            }

            // Handle user info sync
            else if (!result.user_sync && !result.attendance_sync && !result.user_info_command_sent) {
              console.log(result);
              console.log("Sending employee info command start");
                const cmd = `C:143:DATA QUERY USERINFO`;
                console.log("Sending employee info command end");
                global.AREA_ID = result.area_id;
                await DeviceController.markUserInfoCommandSent(result.serial_number);
                return res.send(cmd);
            }

            else if (result.reboot && !result.reboot_command_sent) {
                const cmd = "C:1000:REBOOT";
               await DeviceController.markRebootCommandSent(result.serial_number);
                return res.send(cmd);
            }

            else if (result.user_sync && !result.attendance_sync && req.query.SN === result.serial_number) {

              console.log(result);
          
              const employeesByArea = await EmployeeController.getEmployeesbyAreaid(result.area_id);
              const employeesFinger = await EmployeeController.getEmployeesFingerbyAreaid(result.area_id);
          
              let employeeDataCmds = [];

              console.log("Total Fingers", employeesFinger.length);
          
              // Add USERINFO commands for employees in the area
              employeeDataCmds = employeeDataCmds.concat(
                  employeesByArea.map(employee => {
                      const actionid = "123";
                      return `C:${actionid}:DATA UPDATE USERINFO PIN=${employee.employee_id}\tName=${employee.name}\tPri=${employee.privilage}\tPasswd=${employee.password}\tCard=${employee.rfid}\tGrp=1\tVerify=0`;
                  })
              );
          
              // If isHorus is true, update BIODATA and BIOPHOTO
              if (result.isHorus) {
                  // Add BIODATA commands for employees with fingerprints
                  employeeDataCmds = employeeDataCmds.concat(
                      employeesFinger.map(employee => {
                          return `C:1000:DATA UPDATE BIODATA Pin=${employee.employee_id}\tNo=${employee.fingerprint_id}\tIndex=0\tValid=1\tDuress=0\tType=1\tMajorVer=12\tMinorVer=0\tTmp=${employee.fingerprint_image}`;
                      })
                  );
          
                  // Add BIOPHOTO commands for employees with passport images
                  employeeDataCmds = employeeDataCmds.concat(
                      employeesByArea
                          .filter(employee => employee.passport_image_temp !== null)
                          .map(employee => {
                              const actionid = "173";
                              return `C:${actionid}:DATA UPDATE BIOPHOTO PIN=${employee.employee_id?.toString()}\tType=9\tFormat=1\tUrl=/biophoto/${employee.employee_id}.jpg`;
                          })
                  );
              } else {
                  // If isHorus is false, update FINGERTMP commands for employees
                  employeeDataCmds = employeeDataCmds.concat(
                      employeesFinger.map(employee => {
                          const actionid = "13";
                          return `C:1000:DATA UPDATE FINGERTMP PIN=${employee.employee_id}\tFID=${employee.fingerprint_id}\tSize=${employee.fingerprint_size}\tValid=\tTMP=${employee.fingerprint_image}`;
                      })
                  );
              }
          
              // Mark the user sync command as sent
              await DeviceController.markUserSyncCommandSent(result.serial_number);
          
              // Return the command string
              console.log(employeeDataCmds.join('\n'));
              return res.send(employeeDataCmds.join('\n'));
          }
          
          
      
        }
    }

    let lastEmployee = await employeeData.getLastCreatedEmployee();

    
    if (lastEmployee) {
      const Sns = await EmployeeController.getAllSns(lastEmployee);

      
      let employeeCommands = [];
      
      for (let i = 0; i < Sns.length; i++) {
        const serialNumber = Sns[i];
        if (req.query.SN == serialNumber) {
    
          const staticEmployee = {
            DeviceUserID: lastEmployee.employee_id,
            FirstName: lastEmployee.name,
            LastName: "",
            PINNO: lastEmployee.password,
            CardNO: lastEmployee.rfid,
            PRIORITY: lastEmployee.privilage,
          };
    
          const actionid = "123";
          const employeeDataCmd = `C:${actionid}:DATA UPDATE USERINFO PIN=${staticEmployee.DeviceUserID}\tName=${staticEmployee.FirstName} ${staticEmployee.LastName}\tPri=${staticEmployee.PRIORITY}\tPasswd=${staticEmployee.PINNO}\tCard=${staticEmployee.CardNO}\tGrp=1\tVerify=0`;
    
          employeeCommands.push(employeeDataCmd);
        }
      }
    
      if (employeeCommands.length > 0) {
        return res.send(employeeCommands.join("\n"));
      }
    
    }
    
    // The code below will not execute if employee data is sent and the function returns.
    

    res.send("OK");
});

  const employeeDataStore = {};

  app.post("/iclock/cdata", async function (req, res) {
    const { SN, table, OpStamp } = req.query;

    // console.log("Received data:", req.rawBody);
    // console.log("Received table:", table);


    
    if (table === "OPERLOG") {

      let lines = req.rawBody;
      if (typeof lines !== "string") {
        lines = lines.toString();
      }
      const lineArray = lines.split("\n");
      const userLines = [];
      lineArray.forEach((line) => {
        if (line.startsWith("USER")) {
          userLines.push(line); 
        }
      });

      for (const line of userLines) {
        const params = line.split(/\s+/);
        let
         userId,
          name,
          pri,
          passwd,
          card,
          grp,
          tz,
          verify,
          viceCard,
          startDatetime,
          endDatetime;

        params.forEach((param) => {
          const [key, value] = param.split("=");
          switch (key) {
            case "PIN":
              userId = value;
              break;
            case "Name":
              name = value;
              break;
            case "Pri":
              pri = value;
              break;
            case "Passwd":
              passwd = value;
              break;
            case "Card":
              card = value;
              break;
            case "Grp":
              grp = value;
              break;
            case "TZ":
              tz = value;
              break;
            case "Verify":
              verify = value;
              break;
            case "ViceCard":
              viceCard = value;
              break;
            case "StartDatetime":
              startDatetime = value;
              break;
            case "EndDatetime":
              endDatetime = value;
              break;
          }
        });

        const dep = await DepartmentController.getDepartmentIdByDepartmentName(
          "Default"
        );
        const des = await DesignationController.getDesignationIdByDesignationName(
          "Default"
        );
        const areaid = await AreaController.getAreaIdByAreaName("Default");
     
const department_id = dep.id;

const designation_id = des.id;


        employeeDataStore[userId] = {
          ...employeeDataStore[userId],
          employee_id: userId,
          name: name || userId,
          password: passwd,
          rfid: card,
          email: ``,
          department_id: department_id,
          designation_id: designation_id,
          area_id: global.AREA_ID || areaid,
          from_device: true,
          privilage : pri,
        };

        if (employeeDataStore[userId]) {
          const mockReq = { body: employeeDataStore[userId] };
          const mockRes = {
            status: (statusCode) => ({
              json: (data) => {
              //  console.log(`Response Status: ${statusCode}`);
              //  console.log(`Response Data:`, data);
              },
            }),
            send: (message) => {
             // console.log(`Response Message: ${message}`);
            },
          };
        //  console.log(mockReq);

          await EmployeeController.createEmployee(mockReq, mockRes);
          delete employeeDataStore[userId]; 
       
        }
      }
      const FingerLines=[];

      employeeFPDataStore ={};
      lineArray.forEach((fline) => {
        if (fline.startsWith("FP")) {
          console.log(`Fingerprint Line: ${fline}`);
          FingerLines.push(fline);
        }
      })

      employeeBIOPHOTODataStore = {};

      const employeeBIOPHOTOLines = [];
      lineArray.forEach((bline) => {
        if (bline.startsWith("BIOPHOTO")) {
          employeeBIOPHOTOLines.push(bline);
        }
      })

      for(const bline of employeeBIOPHOTOLines) {
        const bparams = bline.split(/\s+/);
        let
        userId,
        size,
        type,
        content;

        bparams.forEach((bparam) => {
          const [key, value] = bparam.split("=");
          switch (key) {
            case "PIN":
              userId = value;
              break;
            case "Size":
              size = value;
              break;
            case "Type":
              type = value;
              break;
            case "Content":
              content = value;
              break;
          }
        });

        employeeBIOPHOTODataStore[userId] = {
          ...employeeBIOPHOTODataStore[userId],
          employeeId: userId,
           size: size,
           type: type,
          passportImage: content,
        };
        const mockReq = {  body: {
          employeeData: employeeBIOPHOTODataStore[userId],
        }, };
        const mockRes = {
          status: (statusCode) => ({
            json: (data) => {
            //  console.log(`Response Status: ${statusCode}`);
            //  console.log(`Response Data:`, data);
            },
          }),
          send: (message) => {
           // console.log(`Response Message: ${message}`);
          },
        };

        await EmployeeController.UpdateEmployeePhoto(mockReq, mockRes);
      }

      for (const fline of FingerLines) {

       const fparams = fline.split(/\s+/);
       let
       userId,
       fid,
       size,
       valid,
       Tmp;

       fparams.forEach((fparam) => {
        const [key, value] = fparam.split("=");
       switch (key) {
         case "PIN":
           userId = value;
           break;
         case "FID":
           fid = value;
           break;
         case "Size":
           size = value;
           break;
           case "Valid":
           valid = value;
           break;
           case "TMP":
           Tmp = fline.split("TMP=")[1]; 
           break;

       }
      });
      employeeFPDataStore[userId] = {
        ...employeeFPDataStore[userId],
        employee_id: userId,
        fingerprint_id: fid,
        fingerprint_size: size,
        fingerprint_valid: valid,
        fingerprint_image: Tmp,
      };
      if(employeeFPDataStore[userId]){

        const mockReq = { body: employeeFPDataStore[userId] };

        const mockRes = {
          status: (statusCode) => ({
            json: (data) => {
            //  console.log(`Response Status: ${statusCode}`);
            //  console.log(`Response Data:`, data);
            },
          }),
          send: (message) => {
           // console.log(`Response Message: ${message}`);
          },
        };
        await EmployeeController.updateEmployeeFinger(mockReq, mockRes);
        delete employeeDataStore[userId]; 
      }
    }

    } else if (table === "BIODATA") {
      let lines = req.rawBody;

      if (typeof lines !== "string") {
        lines = lines.toString();
      }

      if (lines.startsWith("BIODATA")) {

        console.log("BIODATA Line:", lines);
        const params = lines.split(/\s+/);
       if (lines.includes("Type=1")) {

    let employeeId = "";
    let fingerIndex = "";
    let fingerValid = "";
    let fingerNo = "";
    let tmpImage = "";  // To store te image data (Tmp)

    // Split the lines into individual "fingerprint" data blocks if multiple lines are present
    let linesArray = lines.split("\n");  // Assuming each line is separated by a newline character

    for (let line of linesArray) {
        let params = line.split(/\s+/);

        // Loop through the parameters for each line and extract relevant information
        for (let param of params) {
            if (param.startsWith("Pin=")) {
                employeeId = param.split("=")[1];  // Extract Employee ID (Pin)
            } else if (param.startsWith("Index=")) {
                fingerIndex = param.split("=")[1];  // Extract Fingerprint Index
            } else if (param.startsWith("Valid=")) {
                fingerValid = param.split("=")[1];  // Extract Fingerprint Validity
            } else if (param.startsWith("No=")) {
                fingerNo = param.split("=")[1];  // Extract Fingerprint Number
            } else if (param.startsWith("Tmp=")) {
                tmpImage = param.split("=")[1];  // Extract image data (Tmp)
            }
        }

        // Now, you can store or process both the fingerprint data and Tmp image data
        const fingerprintData = {
          employee_id: employeeId,
            fingerIndex: fingerIndex,
            fingerprint_valid: fingerValid,
            fingerprint_id: fingerNo,
            fingerprint_image: tmpImage,  // Store the Tmp image data
        };

        console.log("Fingerprint Data for Duress:", fingerprintData);

        // Assuming there's a method to handle saving the fingerprint and image data for duress:
        const mockFingerReq = {
          body: {
            ...fingerprintData, // Spread the fingerprint data directly into the body
        },
        };
        const mockFingerRes = {
            status: (statusCode) => ({
                json: (data) => {
                    console.log(`Fingerprint Response Status: ${statusCode}`);
                    console.log(`Fingerprint Response Data:`, data);
                },
            }),
            send: (message) => {
                console.log(`Fingerprint Response Message: ${message}`);
            },
        };

        // Call method to save or process fingerprint data and image data for duress
        await EmployeeController.updateEmployeeFinger(mockFingerReq, mockFingerRes);

        // Optional: clear data or handle any additional logic after processing each line
    }
}

        
        // {
        //   let employeeId = "";
        //   let employeeImage = "";
  
        //   for (let param of params) {
        //     if (param.startsWith("Pin=")) {
        //       employeeId = param.split("=")[1];
        //     } else if (param.startsWith("Tmp=")) {
        //       employeeImage = param.split("=")[1];
        //     }
        //   }
  
        //   employeeDataStore[employeeId] = {
        //     ...employeeDataStore[employeeId],
        //     employeeId: employeeId,
        //     passportImage: employeeImage,
        //   };
  
  
        //   if (employeeDataStore[employeeId]) {
        //     const mockReq = { 
        //       body: { 
        //         employeeData: employeeDataStore[employeeId]
        //       }
        //     };
        //     const mockRes = {
        //       status: (statusCode) => ({
        //         json: (data) => {
        //           console.log(`Response Status: ${statusCode}`);
        //           console.log(`Response Data:`, data);
        //         },
        //       }),
        //       send: (message) => {
        //         console.log(`Response Message: ${message}`);
        //       },
        //     };
  
        //     await EmployeeController.UpdateEmployeePhoto(mockReq, mockRes);
  
        //     delete employeeDataStore[employeeId];
        //   }
        // }

       
      }
      
     
    } else if (table === "ATTLOG") {

      let lines =req.rawBody;
         
       console.log(lines);
      let terminalid = req.query.SN;

    
      if (typeof lines !== "string") {
        lines = lines.toString();
      }
    
      const entries = lines.trim().split("\n");

    
      for (const entry of entries) {
        const params = entry.trim().split(/\s+/);
    
     
        const employeeId = params[0];
        const datetime = `${params[1]} ${params[2]}`;
        const attendanceState = params[3];
    
        const mockReq = {
          body: {
            employee_id: employeeId,
            datetime: datetime,
            attendance_state: attendanceState,
            terminal_id: terminalid,
          },
        };
    
        const mockRes = {
          status: (statusCode) => ({
            json: (data) => {
          //    console.log(`Response Status: ${statusCode}`);
          //    console.log(`Response Data:`, data);
            },
          }),
          send: (message) => {
        //    console.log(`Response Message: ${message}`);
          },
        };
    
      await AttendanceController.recordAttendance(mockReq, mockRes);
      }
    }
     

   res.send("OK");
  });

    app.post("/iclock/devicecmd", async function (req, res) {
      console.log(req.rawBody);
      console.log(req.query);
    res.send("OK"); 
    });

    app.post("/iclock/cdata", async function (req, res) {

      console.log(req.query);
      //console.log(req.body);

     if(req.query.table==="options"){

       res.send("OK");
     }

    });


};
