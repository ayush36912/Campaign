import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { X } from "react-bootstrap-icons"
import Select from "react-select";
 
const URL_SERV = 'http://localhost:3000';
 
const CreateCampaign = ({ campaigns ,formData, onChange, onSubmit, editing, onUpdate}) => {
 
  const { id } = useParams();
 const [initialFormData, setInitialFormData] = useState({...formData});
 const [imageFile, setImageFile] = useState([]);
 const [imagePreviews, setImagePreviews] = useState([]);
 const [oldImagePreviews, setOldImagePreviews] = useState([]);
 const [errors, setErrors] = useState({});
 const [userIds, setUserIds] = useState([]);
 const [selectedUserIds, setSelectedUserIds] = useState([]);
 const navigate = useNavigate();
 const [image ,setImage] = useState([]);
 
 let errorMessage = '';
  let err =  {};
  let formIsValid = true;
 
  useEffect(() => {
    if (editing && campaigns.length > 0) {
      const campaign = campaigns.find(campaign => campaign._id === id);
      if (campaign) {
        setInitialFormData({ ...campaign, assignedUsers: []});
        if (campaign.imageUrl) {
          setImage(campaign.imageUrl);
          console.log('image',image);
          const previews = campaign.imageUrl.map((imageUrl) => {
            return `http://localhost:3000/${imageUrl}`;
          });
          setOldImagePreviews(previews);
        }
      }
    } else {
      setInitialFormData({ ...formData });
    }
 
  }, [campaigns, formData, editing, id]);
 
  useEffect(() => {
    const fetchUserIds = async () => {
      try {
        const response = await fetch(`${URL_SERV}/users`,{
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserIds(data.emails);
        } else {
          throw new Error('Failed to fetch user IDs');
        }
      } catch (error) {
        console.error('Error fetching user IDs:', error);
      }
    };
    fetchUserIds();
  }, []);
 
  const handleOldDelete = async (index) => {
    const updatedOldImagePreviews = [...oldImagePreviews];
    updatedOldImagePreviews.splice(index, 1);
    setOldImagePreviews(updatedOldImagePreviews);

    const oldimage = [...image];
    oldimage.splice(index,1);
    setImage(oldimage);
  };  

  const handleNewDelete = async (index) => {
    const updatedNewImagePreviews = [...imagePreviews];
    updatedNewImagePreviews.splice(index, 1);
    setImagePreviews(updatedNewImagePreviews);

    const oldImageFile = [...imageFile]
    console.log("oldimage",oldImageFile);
    oldImageFile.splice(index, 1);
    console.log("handleNewDelete",oldImageFile);
    setImageFile(oldImageFile);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    errorMessage = validateField(name, value);
    err = {...err,  [name]: errorMessage};
    setErrors(err);
    if(editing){
      setInitialFormData({ ...initialFormData, [name]: value});
    }else{
      setInitialFormData({...initialFormData, [name]:value});
      //onChange(e);
    }
  };
 
  const handleSelectChange = (selectedOptions) => {
    const selectedIds = selectedOptions.map(option => option.value);
    setSelectedUserIds(selectedIds);
    setInitialFormData({ ...initialFormData, assignedUsers: selectedIds });
  };
 
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if(value.trim() === ''){
          return "Title is requried";
        }else if (value.trim().length < 3) {
          return 'Title must be at least 3 characters long';
        }
        break;
      case "imageUrl":
        const fileSizeLimit = 5 * 1024 * 1024;
        console.log(imagePreviews.length);
        console.log(oldImagePreviews.length);
        if (imagePreviews.length == 0 && oldImagePreviews.length == 0) {
          return "please select an image";
        } else {
          if (value.size > fileSizeLimit) {
            return "File size exceeds 5MB limit";
          }
        }
      break;
      case 'description':
        if(value.trim() === ''){
          return "Description is requried";
        }else if (value.trim().length < 8) {
          return 'Description must be at least 8 characters long';
        } else if (value.trim().length > 200) {
          return 'Description must be at most 200 characters long';
        }
      break;
      case 'assignedUsers':
        console.log(value);
        if(type.value === 'private' && value.length === 0){
          return "Atleast one user should be assigned to the Campaign";
        }
      break;
      default:
      break;
    }
  };
 
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if(files.length > 5){
     e.preventDefault();
     alert(`Cannot upload files more than 5`);
     formIsValid = false;
     return;
    }
    const previews = await Promise.all(files.map(file => {
      console.log("File extension:", file.name.split('.').pop());
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }));
    console.log(previews);
    const file = [...files];
    console.log('file:',file);
    setImagePreviews(prevPreviews => [...prevPreviews, ...previews]);
    setImageFile(file);
 }
 
  const handleSubmit =async (e) => {
    e.preventDefault();
    formIsValid = true;
    for (const key in initialFormData) {
      const errorMessage = validateField(key, initialFormData[key]);
      err[key] = errorMessage;
      if (errorMessage) {
        formIsValid = false;
      }
    }
    setErrors(err);
 
    if(formIsValid){
      const formDataWithImage = new FormData();
      const { imageUrl, ...formDataWithoutImage } = initialFormData;
      for (const key in formDataWithoutImage) {
        formDataWithImage.append(key, initialFormData[key]);
      }
      formDataWithImage.append('oldimage', image);
      imageFile.forEach((file)=> {
        formDataWithImage.append( "imageUrl" , file );
        console.log("handlesubmit:",file);
      })
     // formDataWithImage.append("imageUrl", imageFile);
    if (editing) {
      await onUpdate(formDataWithImage,initialFormData._id);
    } else {
      await onSubmit(e, formDataWithImage);
    }
    navigate('/campaigns', { replace: true });
  }
  };
 
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-white">
            {editing ? 'Edit Campaign' : 'Create Campaign'}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    className={`form-control ${errors.title && 'is-invalid'}`}
                    id="title"
                    name="title"
                    value={initialFormData.title}
                    onChange={handleChange}
                    maxLength={30}
                    required
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    className="form-control custom-select"
                    id="type"
                    name="type"
                    value={initialFormData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="image">Image</label><br/>
                  <input
                    type="file"
                    className={`form-control ${errors.imageUrl && "is-invalid"}`}
                    id="imageUrl"
                    name="imageUrl"
                    // value={initialFormData.imageUrl.length.toString()}
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple
                    required
                  />
                  {errors.imageUrl && <div className="invalid-feedback">{errors.imageUrl}</div>}
                  <div className="form-group">
                  <div className="image-previews my-2">
                  {oldImagePreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative', display: 'inline-block' , textAlign: 'center'}}
                    >
                      <img
                      src={preview}
                      alt={`${index}`}
                      style={{ width: '100px', height: 'auto', marginRight: '10px' }}
                      id="old-image-preview"
                      />
                      <div style={{ position: 'absolute', top: '-0%', left: '90%', transform: 'translate(-50%, -50%)' }}>
                        <X onClick={() => handleOldDelete(index)} className="w-5 h-5 border border-danger rounded-circle bg-danger"/>
                      </div>
                    </div>
                  ))}
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative', display: 'inline-block' , textAlign: 'center'}}
                    >
                    <img src={preview} alt={`${index}`} style={{ width: "100px", height: "auto", marginRight: "10px" }} />
                    <div style={{ position: 'absolute', top: '-0%', left: '90%', transform: 'translate(-50%, -50%)' }}>
                      <X onClick={()=>handleNewDelete(index)} className="w-5 h-5 border border-danger rounded-circle bg-danger"/>
                    </div>
                    </div>
                  ))}
                  </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    className={`form-control ${errors.description && 'is-invalid'}`}
                    id="description"
                    name="description"
                    value={initialFormData.description}
                    onChange={handleChange}
                    maxLength={200}
                    rows="3"
                    required
                  ></textarea>
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>
                {initialFormData.type === "private" && (
                  <div className="form-group">
                    <label htmlFor="assignedUsers">Assigned User</label>
                    <Select
                      className={`form-control ${errors.assignedUsers && 'is-invalid'}`}
                      id="assignedUsers"
                      name="assignedUsers"
                      value={selectedUserIds.map(id => ({ value: id , label: id }))}
                      onChange={handleSelectChange}
                      options={userIds.map(userId => ({ value: userId, label: userId }))}
                      isMulti
                      required
                    />            
                    {errors.assignedUsers && <div className="invalid-feedback">{errors.assignedUsers}</div>}
                  </div>
                )}
                <button type="submit" className="btn btn-orange mt-2">
                {editing ? 'Save Changes' : 'Create'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default CreateCampaign;