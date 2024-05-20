import React, { useEffect, useState } from  'react';
import { Route, Routes, useLocation} from 'react-router-dom';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import CreateCampaign from './components/campaign/CreateCampaign';
import CampaignList from './components/campaign/CampaignList';
import Header from './components/common/Header';
import UpdateCampaign from './components/campaign/UpdateCampaign';
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import AuthGuard from '../AuthGuard';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import AddUserToCampaign from './components/campaign/AddUserToCampaign';
import RemoveUserFromCampaign from './components/campaign/RemoveUserFromCampaign';
import MainLayout from './layout/MainLayout';
import { toast } from 'react-toastify';
import CampaignDetails from './components/campaign/CampaignDetails';
import ForgotPassword from './components/auth/ForgotPassword';
import UpdatePassword from './components/auth/UpdatePassword';
import DeleteUser from './components/user/DeleteUser';
import EnrolledCampaigns from './components/campaign/EnrolledCampaigns';

const URL_SERV = 'http://localhost:3000';

const App =()=> {

  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    type: "public",
    imageUrl: "",
    description: "",
    assignedUsers: "",
  });
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState("");

  const location = useLocation( );

  useEffect(() => {
    if(location.pathname !== `/updatecampaign`){
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${URL_SERV}/admin/campaigns`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };
    fetchCampaigns();
  }
  }, [location]);

  useEffect(() => {
    if (editing && location.pathname !== `/campaign/${editId}`) {
      setEditing(false);
      console.log(editing);
    }
  }, [location]);

  useEffect(() => {
    const isCampaignPage = location.pathname === `/updatecampaign` || location.pathname.startsWith('/campaigndetails/');
    if(isCampaignPage) {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${URL_SERV}/admin/updatecampaigns`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };
    fetchCampaigns();
  }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit =async (e, formDataWithImage) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await fetch(`${URL_SERV}/admin/campaign`, {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'multipart/form-data',
        // },
        credentials: 'include',
        body: formDataWithImage,
      });
      console.log(response);
      if(response.ok){
        const data = await response.json();
        console.log('Campaign created successfully:', data);
        setCampaigns([...campaigns, data]);
        toast.success('Campaign created successfully');
      }else{
        console.log('server error');
      }
    } catch (err) {
      console.error('Error creating Campaign :', err);
    }
  };

  const handleEdit = (campaignId) => {
    setEditing(true);
    console.log('handleedit');
    setEditId(campaignId);
  }

  const handleUpdate = async (formDataWithImage,editId) => {
    try{
      console.log('ed');
    const response = await fetch(`${URL_SERV}/admin/campaign/${editId}`, {
      method: 'PUT',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      credentials: 'include',
      body: formDataWithImage,
    });
    if(response.ok){
    console.log(response);
    const updatedCampaign = await response.json();
    const updatedCampaigns = campaigns.map(campaign =>
      campaign._id === editId ? updatedCampaign : campaign
    );
    setCampaigns(updatedCampaigns);
    console.log('Campaign updated successfully:', updatedCampaigns);
    toast.success('Campaign updated successfully');
    }else{
      console.log('server error');
    }
  } catch (err) {
    console.error('Error updating campaign:', err);
  }
  };

  const handleDelete = async (campaignId) => {
    try {
      const response = await fetch(`${URL_SERV}/admin/campaign/${campaignId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if(response.ok) {
      setCampaigns(campaigns.filter(campaign => campaign._id !== campaignId));
      console.log('Campaign deleted successfully');
      toast.success('Campaign deleted successfully');
      } else {
        console.log('Could not delete campaign'); 
        toast.error('Cannot delete campaign with enrolled users.');
      }
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  }

  return (
    <AuthProvider>
      <div>
        <Header/>
        <MainLayout>
        <Routes>
        <Route path="/" element={<CampaignList campaigns={campaigns}/>}/>
        <Route path="campaigns" element={<CampaignList campaigns={campaigns}/>}/>
        <Route path="login" element={<Login/>}/>
        <Route path="signup" element={<SignUp/>}/> 
        <Route path="forgotPassword" element={<ForgotPassword/>}/>
        <Route path="deleteUser" element={<AuthGuard><DeleteUser/></AuthGuard>}/>
        <Route path="createcampaign" element={<AuthGuard><CreateCampaign campaigns={campaigns} formData={formData} editing={editing} onChange={handleChange} onSubmit={handleSubmit} onEdit={handleEdit} onUpdate={handleUpdate}/></AuthGuard>}/>
        <Route path="updatecampaign" element={<AuthGuard><UpdateCampaign campaigns = {campaigns} editing={editing} onEdit={handleEdit} onDelete={handleDelete} onUpdate= {handleUpdate}/></AuthGuard>}/>
        <Route path="campaign/:id" element={<AuthGuard><CreateCampaign campaigns={campaigns} formData={formData} editing={editing} onChange={handleChange} onSubmit={handleSubmit} onEdit={handleEdit} onUpdate={handleUpdate}/></AuthGuard>}/>
        <Route path="campaigndetails/:id" element = {<CampaignDetails campaigns={campaigns}/>} /> 
        <Route path="reset/:token" element = {<UpdatePassword/>}/>
        <Route path="enrolledCampaigns" element={<EnrolledCampaigns/>}/>
        <Route path="campaign/:campaignId/assignUser" element={<AuthGuard><AddUserToCampaign/></AuthGuard>}/>      
        <Route path="campaign/:campaignId/removeUser" element={<AuthGuard><RemoveUserFromCampaign/></AuthGuard>}/>
        </Routes>
        </MainLayout>
      </div>
    </AuthProvider>
  )
}

export default App
