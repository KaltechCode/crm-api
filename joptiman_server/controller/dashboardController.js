const Policies = require('../models/PoliciesSchema');
const Agent = require('../models/AgentSchema')


exports.getMonthlyPolicyData = async (req, res) => {
  try {
    const policies = await Policies.find({ isPaid: true });
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const requestedMonth = req.params.month;
    const requestedMonthKey = `${currentYear}/${requestedMonth}`;

    console.log("requestedMonthKey", requestedMonthKey)

    // Initialize monthly policy data
    const monthlyPolicyData = {
      Life: {
        count: 0,
        totalSale: 0,
        totalRevenue: 0,
      },
      Health: {
        count: 0,
        totalSale: 0,
        totalRevenue: 0,
      },
      Annuities: {
        count: 0,
        totalSale: 0,
        totalRevenue: 0,
      },
    };

    // Process each policy
    policies.forEach(policy => {
      const paidOutDate = new Date(policy.paidOutDate);
      const policyType = policy.policyType;
      const policyValue = policy.policyValue || 0;
      const agencyCommission = policy.agencyCommission || 0;
      const month = paidOutDate.toLocaleString('en-US', { month: 'long' });
      const year = paidOutDate.getFullYear();
      const monthKey = `${year}/${month}`;

      // Only consider policies with matching monthKey and requestedMonthKey
      if (monthKey === requestedMonthKey) {
        monthlyPolicyData[policyType].count++;
        monthlyPolicyData[policyType].totalSale += policyValue;
        monthlyPolicyData[policyType].totalRevenue += agencyCommission;
      }
    });
    res.send(monthlyPolicyData);

  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getYearlyMonthlyPolicyData = async (req, res) => {
  try {
    // Retrieve policies from the database
    const policies = await Policies.find();
    const requestedYear = parseInt(req.params.year);
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentMonthKey = `${requestedYear}-${currentMonth}`

    // Initialize yearly policy data
    const yearlyPolicyData = {
      overallTotalSoldPolicies: 0,
      overallTotalSalesCost: 0,
      overallTotalRevenue: 0,
      currentMonth: currentMonth,
      currentMonthPolicies: 0,
      currentMonthSalesCost: 0,
      currentMonthRevenue: 0,
      currentMonthHealth: 0,
      currentMonthLife: 0,
      currentMonthAnnuities: 0,
      totalHealthInsurance: 0,
      totalLifeInsurance: 0,
      totalAnnuities: 0,
      barChartData: {},
    };


    // Initialize data for each month of the year
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const month = new Date(requestedYear, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
      const monthKey = `${requestedYear}-${month}`;


      yearlyPolicyData.barChartData[monthKey] = {
        totalSoldPolicies: 0,
        totalSalesCost: 0,
        totalRevenue: 0,
        Life: {
          count: 0,
          totalSale: 0,
          totalRevenue: 0,
        },
        Health: {
          count: 0,
          totalSale: 0,
          totalRevenue: 0,
        },
        Annuities: {
          count: 0,
          totalSale: 0,
          totalRevenue: 0,
        },
      };
    }


    // Process each policy
    policies.forEach(policy => {
      const paidOutDate = new Date(policy.paidOutDate);
      const policyType = policy.policyType;
      const policyValue = policy.policyValue || 0;
      const agencyCommission = policy.agencyCommission || 0;
      const month = paidOutDate.toLocaleString('en-US', { month: 'long' });
      const year = paidOutDate.getFullYear();
      const monthKey = `${year}-${month}`;

      // Check if the policy belongs to the requested year
      if (year === requestedYear) {
        // Increment the counts and totals based on policy type
        yearlyPolicyData.barChartData[monthKey].totalSoldPolicies++;
        yearlyPolicyData.barChartData[monthKey].totalSalesCost += policyValue;
        yearlyPolicyData.barChartData[monthKey].totalRevenue += agencyCommission;

        yearlyPolicyData.barChartData[monthKey][policyType].count++;
        yearlyPolicyData.barChartData[monthKey][policyType].totalSale += policyValue;
        yearlyPolicyData.barChartData[monthKey][policyType].totalRevenue += agencyCommission;

        // Update overall totals
        yearlyPolicyData.overallTotalSoldPolicies++;
        yearlyPolicyData.overallTotalSalesCost += policyValue;
        yearlyPolicyData.overallTotalRevenue += agencyCommission;

        yearlyPolicyData.totalAnnuities = yearlyPolicyData.barChartData[monthKey].Annuities.count
        yearlyPolicyData.totalHealthInsurance = yearlyPolicyData.barChartData[monthKey].Health.count
        yearlyPolicyData.totalLifeInsurance = yearlyPolicyData.barChartData[monthKey].Life.count

      }

      if (currentMonthKey === monthKey) {
        yearlyPolicyData.currentMonthPolicies++;
        yearlyPolicyData.currentMonthSalesCost += policyValue;
        yearlyPolicyData.currentMonthRevenue += agencyCommission;

        yearlyPolicyData.currentMonthAnnuities = yearlyPolicyData.barChartData[currentMonthKey].Annuities.count
        yearlyPolicyData.currentMonthHealth = yearlyPolicyData.barChartData[currentMonthKey].Health.count
        yearlyPolicyData.currentMonthLife = yearlyPolicyData.barChartData[currentMonthKey].Life.count
      }
    });


    // Send the response
    res.json(yearlyPolicyData);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getDetailsOfHighestCommissionedAgent = async (req, res) => {
  try {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getYear()
    const requestedMonth = req.params.month;
    const requestedMonthKey = `${requestedMonth}/${currentYear}`

    // let requestedMonthKey = ""

    // if (currentMonth === 'January') {
    //   if (requestedMonth === 'December' || requestedMonth === 'November' || requestedMonth === 'October' || requestedMonth === 'September' || requestedMonth === 'August' || requestedMonth === 'July') {
    //     requestedMonthKey = `${requestedMonth}/${currentYear - 1}`
    //   }
    //   else {
    //     requestedMonthKey = `${requestedMonth}/${currentYear}`
    //   }
    // }


    const policies = await Policies.find();


    let highestCommission = 0;
    let highestCommissionAgent = null;

    if (policies) {
      for (const policy of policies) {
        const paidOutDate = new Date(policy.paidOutDate);
        const month = paidOutDate.toLocaleString('en-US', { month: 'long' });
        const year = paidOutDate.getYear()
        const monthKey = `${month}/${year}`
        const agentCommission1 = policy.agentCommission;

        if (requestedMonthKey === monthKey) {
          const agentCommission = policy.agentCommission;
          const agentCode = policy.agentCode;

          if (agentCode !== 'AS9V1V') {
            if (agentCommission > highestCommission) {
              const agent = await Agent.findOne({ agentCode: agentCode })

              highestCommission = agentCommission;
              highestCommissionAgent = {
                agentTitle: agent.agentTitle,
                agentCommission: agent.agentCommission,
                firstName: agent.firstName,
                lastName: agent.lastName,
                profilePic: agent.profilePic,
                // agentTitle,
                // agentCommission,
                // firstName,
                // lastName
              };
            }
            else {

            }
          }
        }
      };
    }
    if (highestCommissionAgent) {
      res.status(200).json(highestCommissionAgent);

    } else {
      // res.status(404).json({ message: 'No policies found for the requested month.' });
      res.json({})
    }

  } catch (error) {
    // res.status(500).json({ message: 'Internal server error' });
    res.status(500).send(error.message)
  }
};

// exports.highestRecruitsAgent = async (req, res) => {
//   try {
//     const currentDate = new Date()
//     const currentMonth = currentDate.getMonth()
//     const currentYear = currentDate.getFullYear()
//     const requestedMonth = req.params.month;
//     const requestedMonthKey = `${requestedMonth}/${currentYear}`

//     const agents = await Agent.find({ isApproved: true })

//     let highestRcruits = 0;
//     let highestRecruitAgent = null;

//     let overwriteAgents = []

//     if (agents) {
//       agents.forEach(
//         async agent => {
//           agentApprovalDate = new Date(agent.agentApprovalDate)
//           const month = agentApprovalDate.toLocaleString('en-us', { month: 'long' })
//           const year = agentApprovalDate.getFullYear()
//           const monthKey = `${month}/${year}`

//           if (requestedMonthKey === monthKey) {
//             console.log("agent", agent.agentCode)
//             const overwrittingAgentCode1 = agent.recruitingAgentCode

//             if (overwrittingAgentCode1 !== 'AS9V1V') {
//               overwriteAgents.push(overwrittingAgentCode1)

//               console.log("overwriteAgents", overwriteAgents)

//             }
//           }
//         }
//       )
//     }


//     if (highestRecruitAgent) {
//       res.status(200).send(highestRecruitAgent)
//     }
//     else {
//       // res.status(404).json({ message: 'No policies found for the requested month.' });
//       res.json({})
//     }
//   } catch (error) {
//     // res.status(500).send("Internal Server Error")
//     res.status(500).send(error.message)
//   }
// }


//CHATGPT
exports.highestRecruitsAgent = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const requestedMonth = req.params.month;
    const requestedMonthKey = `${requestedMonth}/${currentYear}`;

    const agents = await Agent.find({ isApproved: true });
    let highestRecruitAgentDetail = null;
    let overwriteAgents = [];

    if (agents) {
      for (const agent of agents) {
        const agentApprovalDate = new Date(agent.agentApprovalDate);
        const month = agentApprovalDate.toLocaleString('en-us', { month: 'long' });
        const year = agentApprovalDate.getFullYear();
        const monthKey = `${month}/${year}`;

        if (requestedMonthKey === monthKey) {
          const overwritingAgentCode = agent.recruitingAgentCode;

          if (overwritingAgentCode !== 'AS9V1V') {
            overwriteAgents.push(overwritingAgentCode);
            console.log("overwriteAgents", overwriteAgents)
          }
        }
      }
    }

    // Function to find the most recurring agent
    const findMostRecurringAgent = (agentsArray) => {
      const frequency = agentsArray.reduce((acc, agent) => {
        acc[agent] = (acc[agent] || 0) + 1;
        return acc;
      }, {});

      let mostRecurringAgent = null;
      let maxCount = 0;

      for (const agent in frequency) {
        if (frequency[agent] > maxCount) {
          maxCount = frequency[agent];
          mostRecurringAgent = agent;
        }
      }

      return mostRecurringAgent;
    };


    const highestRecruitAgentCode = findMostRecurringAgent(overwriteAgents);

    if (highestRecruitAgentCode) {
      const highestRecruitAgent = await Agent.findOne({ agentCode: highestRecruitAgentCode })

      highestRecruitAgentDetail = {
        agentTitle: highestRecruitAgent.agentTitle,
        firstName: highestRecruitAgent.firstName,
        lastName: highestRecruitAgent.lastName,
        profilePic: highestRecruitAgent.profilePic,
      }
    }

    if (highestRecruitAgentDetail) {
      res.status(200).send({ highestRecruitAgentDetail });
    } 

  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.TotalNoOfRecruits = async (req, res) => {
  try {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const requestedMonth = req.params.month;
    const requestedMonthKey = `${requestedMonth}/${currentYear}`
    // let requestedMonthKey = ""

    // if (currentMonth === 'January') {
    //   if (requestedMonth === 'December' || requestedMonth === 'November' || requestedMonth === 'October' || requestedMonth === 'September' || requestedMonth === 'August' || requestedMonth === 'July') {
    //     requestedMonthKey = `${requestedMonth}/${currentYear - 1}`
    //   }
    //   else {
    //     requestedMonthKey = `${requestedMonth}/${currentYear}`
    //   }
    // }

    let noOfRecruits = 0
    const agents = await Agent.find({ isApproved: true })

    agents.forEach(agent => {
      agentApprovalDate = new Date(agent.agentApprovalDate)
      const agentCode = agent.agentCode
      const month = agentApprovalDate.toLocaleString('en-us', { month: 'long' })
      const year = agentApprovalDate.getFullYear()
      const monthKey = `${month}/${year}`
      const recruitingAgentCode = agent.recruitingAgentCode


      if (recruitingAgentCode !== 'AS9V1V') {
        if (monthKey === requestedMonthKey) {
          // console.log("agentApprovalDate",agentApprovalDate)
          console.log("agentCode", agentCode)
          noOfRecruits++
        }
      }

    })

    res.status(200).json({ noOfRecruits: noOfRecruits })
    // res.sendStatus(200)
  } catch (error) {
    res.status(200).send(error.message)
  }

}

exports.getPreviousYears = async (req, res) => {
  try {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()

    let previousYears = []

    for (let i = 1; i <= 5; i++) {
      previousYears.push(currentYear - i);
    }

    res.status(200).send(previousYears)
  } catch (error) {
    res.status(500).send("Internal Server Error")
  }
}

exports.getPreviousMonths = async (req, res) => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1;

  console.log("currentMonth", currentMonth);

  const previousMonths = []
  const monthNames = [
    {
      name: "Jan",
      index: 1,
    },
    {
      name: "February",
      index: 2,
    },
    {
      name: "March",
      index: 3,
    },
    {
      name: "April",
      index: 4,
    },
    {
      name: "May",
      index: 5,
    },
    {
      name: "June",
      index: 6,
    },
    {
      name: "July",
      index: 7,
    },
    {
      name: "August",
      index: 8
    },
    {
      name: "September",
      index: 9
    },
    {
      name: "October",
      index: 10
    },
    {
      name: "November",
      index: 11
    },
    {
      name: "December",
      index: 12
    },
  ];

  if (currentMonth === 1) {
    previousMonths.push("December", "November", "October", "September", "August", "July");
  }
  else {
    for (let i = 1; i < currentMonth; i++) {
      let month = currentMonth - i;
      if (month === 0) {
        month += 12;
      }
      else if (month < 0) {
        month = currentMonth - i + 1
      }
      const monthName = monthNames.find(m => m.index === month).name;
      previousMonths.push(monthName);
    }
  }

  res.status(200).send(previousMonths)
}

//AgentView
// exports.getMonthlyPolicyData_AgentView = async (req, res) => {
//   try {
//     const agentCode = req.user.agentCode;
//     const policies = await Policies.find({
//       $or: [
//         { agentCode: agentCode },
//         { overwrittingAgentCode1: agentCode },
//         { overwrittingAgentCode2: agentCode },
//         { split1_AgentCode: agentCode },
//         { split2_AgentCode: agentCode },
//         { split_1_OWAgent1_AgentCode: agentCode },
//         { split_1_OWAgent2_AgentCode: agentCode },
//         { split_2_OWAgent1_AgentCode: agentCode },
//         { split_2_OWAgent2_AgentCode: agentCode }
//       ]
//     });
//     const requestedMonth = req.params.month;


//     // Initialize yearly policy data
//     const monthlyPolicyData = {};

//     if (policies.length > 0) {
//       policies.forEach(policy => {
//         const paidOutDate = new Date(policy.paidOutDate);
//         const policyType = policy.policyType;
//         const policyValue = policy.policyValue || 0;
//         const agentCommission = policy.agentCommission || 0;
//         const month = paidOutDate.toLocaleString('en-US', { month: 'long' });
//         const year = paidOutDate.getFullYear();
//         const monthKey = `${year}-${month}`;


//         if (!monthlyPolicyData[requestedMonth]) {
//           monthlyPolicyData[requestedMonth] = {
//             Life: {
//               count: 0,
//               totalSale: 0,
//               totalRevenue: 0,
//             },
//             Health: {
//               count: 0,
//               totalSale: 0,
//               totalRevenue: 0,
//             },
//             Annuities: {
//               count: 0,
//               totalSale: 0,
//               totalRevenue: 0,
//             },
//           };
//         }



//         if (month === requestedMonth) {
//           if (!monthlyPolicyData[month]) {
//             monthlyPolicyData[month] = {
//               Life: {
//                 count: 0,
//                 totalSale: 0,
//                 totalRevenue: 0,
//               },
//               Health: {
//                 count: 0,
//                 totalSale: 0,
//                 totalRevenue: 0,
//               },
//               Annuities: {
//                 count: 0,
//                 totalSale: 0,
//                 totalRevenue: 0,
//               },
//             };
//           }

//           monthlyPolicyData[month][policyType].count++;
//           monthlyPolicyData[month][policyType].totalSale += policyValue;
//           monthlyPolicyData[month][policyType].totalRevenue += agentCommission;
//         }
//       });
//     }
//     else {

//     }


//     if (Object.keys(monthlyPolicyData).length > 0) {
//       res.json(monthlyPolicyData);

//     } else {
//       res.json(monthlyPolicyData);
//       // res.send([])
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

exports.getMonthlyPolicyData_AgentView = async (req, res) => {
  try {
    const agentCode = req.user.agentCode;
    const policies = await Policies.find({
      $or: [
        { agentCode: agentCode },
        { overwrittingAgentCode1: agentCode },
        { overwrittingAgentCode2: agentCode },
        { split1_AgentCode: agentCode },
        { split2_AgentCode: agentCode },
        { split_1_OWAgent1_AgentCode: agentCode },
        { split_1_OWAgent2_AgentCode: agentCode },
        { split_2_OWAgent1_AgentCode: agentCode },
        { split_2_OWAgent2_AgentCode: agentCode }
      ]
    });
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const requestedMonth = req.params.month;
    const requestedMonthKey = `${currentYear}/${requestedMonth}`;

    console.log("requestedMonthKey", requestedMonthKey)

    // Initialize monthly policy data
    const monthlyPolicyData = {
      Life: {
        count: 0,
        totalSale: 0,
        totalRevenue: 0,
      },
      Health: {
        count: 0,
        totalSale: 0,
        totalRevenue: 0,
      },
      Annuities: {
        count: 0,
        totalSale: 0,
        totalRevenue: 0,
      },
    };

    // Process each policy
    policies.forEach(policy => {
      const paidOutDate = new Date(policy.paidOutDate);
      const policyType = policy.policyType;
      const policyValue = policy.policyValue || 0;
      const agentCommission = policy.agentCommission || 0;
      const month = paidOutDate.toLocaleString('en-US', { month: 'long' });
      const year = paidOutDate.getFullYear();
      const monthKey = `${year}/${month}`;

      // console.log("monthKey", monthKey)

      // Only consider policies with matching monthKey and requestedMonthKey
      if (monthKey === requestedMonthKey) {
        console.log("equal");
        // console.log("policyType", policyType)
        // console.log(`Before update - ${policyType} count: ${monthlyPolicyData[policyType].count}, totalSale: ${monthlyPolicyData[policyType].totalSale}, totalRevenue: ${monthlyPolicyData[policyType].totalRevenue}`);

        // console.log("policyValue", policyValue);
        // console.log("agencyCommission", agencyCommission);

        monthlyPolicyData[policyType].count++;
        monthlyPolicyData[policyType].totalSale += policyValue;
        monthlyPolicyData[policyType].totalRevenue += agentCommission;

        // console.log(`After update - ${policyType} count: ${monthlyPolicyData[policyType].count}, totalSale: ${monthlyPolicyData[policyType].totalSale}, totalRevenue: ${monthlyPolicyData[policyType].totalRevenue}`);

      }
    });

    // console.log("monthlyPolicyData", monthlyPolicyData)

    res.send(monthlyPolicyData);

  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getYearlyMonthlyPolicyData_AgentView = async (req, res) => {
  try {
    // Retrieve policies from the database
    const agentCode = req.user.agentCode
    // const policies = await Policies.find({agentCode:userId});
    const policies = await Policies.find({
      $or: [
        { agentCode: agentCode },
        { overwrittingAgentCode1: agentCode },
        { overwrittingAgentCode2: agentCode },
        { split1_AgentCode: agentCode },
        { split2_AgentCode: agentCode },
        { split_1_OWAgent1_AgentCode: agentCode },
        { split_1_OWAgent2_AgentCode: agentCode },
        { split_2_OWAgent1_AgentCode: agentCode },
        { split_2_OWAgent2_AgentCode: agentCode }
      ]
    });
    const requestedYear = parseInt(req.params.year);
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentMonthKey = `${requestedYear}-${currentMonth}`

    // Initialize yearly policy data
    const yearlyPolicyData = {
      overallTotalSoldPolicies: 0,
      overallTotalSalesCost: 0,
      overallTotalRevenue: 0,
      currentMonth: currentMonth,
      currentMonthPolicies: 0,
      currentMonthSalesCost: 0,
      currentMonthRevenue: 0,
      currentMonthHealth: 0,
      currentMonthLife: 0,
      currentMonthAnnuities: 0,
      totalHealthInsurance: 0,
      totalLifeInsurance: 0,
      totalAnnuities: 0,
      barChartData: {},
    };


    // Initialize data for each month of the year
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const month = new Date(requestedYear, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
      const monthKey = `${requestedYear}-${month}`;


      yearlyPolicyData.barChartData[monthKey] = {
        totalSoldPolicies: 0,
        totalSalesCost: 0,
        totalRevenue: 0,
        Life: {
          count: 0,
          totalSale: 0,
          totalRevenue: 0,
        },
        Health: {
          count: 0,
          totalSale: 0,
          totalRevenue: 0,
        },
        Annuities: {
          count: 0,
          totalSale: 0,
          totalRevenue: 0,
        },
      };
    }

    if (policies) {
      policies.forEach(policy => {
        const paidOutDate = new Date(policy.paidOutDate);
        const policyType = policy.policyType;
        const policyValue = policy.policyValue || 0;
        const agencyCommission = policy.agencyCommission || 0;
        const month = paidOutDate.toLocaleString('en-US', { month: 'long' });
        const year = paidOutDate.getFullYear();
        const monthKey = `${year}-${month}`;

        // Check if the policy belongs to the requested year
        if (year === requestedYear) {
          // Increment the counts and totals based on policy type
          yearlyPolicyData.barChartData[monthKey].totalSoldPolicies++;
          yearlyPolicyData.barChartData[monthKey].totalSalesCost += policyValue;
          yearlyPolicyData.barChartData[monthKey].totalRevenue += agencyCommission;

          yearlyPolicyData.barChartData[monthKey][policyType].count++;
          yearlyPolicyData.barChartData[monthKey][policyType].totalSale += policyValue;
          yearlyPolicyData.barChartData[monthKey][policyType].totalRevenue += agencyCommission;

          // Update overall totals
          yearlyPolicyData.overallTotalSoldPolicies++;
          yearlyPolicyData.overallTotalSalesCost += policyValue;
          yearlyPolicyData.overallTotalRevenue += agencyCommission;

          yearlyPolicyData.totalAnnuities = yearlyPolicyData.barChartData[monthKey].Annuities.count
          yearlyPolicyData.totalHealthInsurance = yearlyPolicyData.barChartData[monthKey].Health.count
          yearlyPolicyData.totalLifeInsurance = yearlyPolicyData.barChartData[monthKey].Life.count

        }

        if (currentMonthKey === monthKey) {
          yearlyPolicyData.currentMonthPolicies++;
          yearlyPolicyData.currentMonthSalesCost += policyValue;
          yearlyPolicyData.currentMonthRevenue += agencyCommission;

          yearlyPolicyData.currentMonthAnnuities = yearlyPolicyData.barChartData[currentMonthKey].Annuities.count
          yearlyPolicyData.currentMonthHealth = yearlyPolicyData.barChartData[currentMonthKey].Health.count
          yearlyPolicyData.currentMonthLife = yearlyPolicyData.barChartData[currentMonthKey].Life.count
        }
      });
    }

    // Send the response
    res.json(yearlyPolicyData);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};








