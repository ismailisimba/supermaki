export {elements as elements};
const eleObj = {};
const eleObjPubl ={};

class elements {
    
    constructor(){
        this.start = this.start;
        this.obj = eleObj;
        this.getEle = getEle;
        
    }

    start(){
        getInitElements();
    }

}



const getInitElements  = ()=>{
    eleObj.notiMsgCardOne = document.querySelectorAll(".dropdown-menu dropdown-menu-lg, .dropdown-menu-right")[0].querySelectorAll(".dropdown-item");
    eleObj.notiMsgCardOne.forEach(element => {
        element.remove();
    });
    eleObj.dividerOne = document.querySelectorAll(".dropdown-menu dropdown-menu-lg, .dropdown-menu-right")[0].querySelectorAll(".dropdown-divider");
    eleObj.dividerOne.forEach(element => {
        element.remove();
    });
    eleObj.notiMsgCardTwo = document.querySelectorAll(".dropdown-menu dropdown-menu-lg, .dropdown-menu-right")[1].querySelectorAll(".dropdown-item");
    eleObj.notiMsgCardTwo.forEach(element => {
        element.remove();
    });
}



const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}

const getEle = (ele)=>{
    if(ele.includes(".")){
        return document.querySelectorAll(`${ele}`);
    }else{
        return document.getElementById(`${ele}`);
    }
}


const removeEle = (ele)=>{
    if(ele.includes(".","#")){
        document.querySelectorAll(`${ele}`).forEach(e=>e.remove());
    }else{
        document.getElementById(`${ele}`).remove();
    }
    return "removed";
}


eleObj.profileCols = `<div class="col-md-3">

<!-- Profile Image -->
<div class="card card-primary card-outline">
  <div class="card-body box-profile">
    <div class="text-center">
      <img class="profile-user-img img-fluid img-circle" src="../icons/noprofile.png" alt="User profile picture">
    </div>

    <h3 class="profile-username text-center">.........</h3>

    <p class="text-muted text-center">......</p>

    <!--<ul class="list-group list-group-unbordered mb-3">
      <li class="list-group-item">
        <b>Followers</b> <a class="float-right">1,322</a>
      </li>
      <li class="list-group-item">
        <b>Following</b> <a class="float-right">543</a>
      </li>
      <li class="list-group-item">
        <b>Friends</b> <a class="float-right">13,287</a>
      </li>
    </ul>-->

    <!--<a href="#" class="btn btn-primary btn-block"><b>Follow</b></a>-->
  </div>
  <!-- /.card-body -->
</div>
<!-- /.card -->

<!-- About Me Box -->
<!-- /.card -->
</div><div class="col-md-9">
<div class="card">
  <div class="card-header p-2">
    <ul class="nav nav-pills">
      <li class="nav-item"><a class="nav-link active" href="#timeline" data-toggle="tab">Details</a></li>
      <li class="nav-item"><a class="nav-link" href="#settings" data-toggle="tab">Edit Details</a></li>
    </ul>
  </div><!-- /.card-header -->
  <div class="card-body">
    <div class="tab-content">
      <!-- /.tab-pane -->
      <div class="tab-pane active" id="timeline">
        <!-- The timeline -->
        <div class="callout callout-info">
                  <h5>Loading...</h5>

                  <p>Loading...</p>
                </div>
      </div>
      <!-- /.tab-pane -->

      <div class="tab-pane" id="settings">
        <form class="form-horizontal" id="profform">
        <div class="form-group row">
            <label for="inputPic" class="col-sm-2 col-form-label">Profile Picture</label>
            <div class="col-sm-10">
            <img src="./icons/noprofile.png" width="169px">
              <input type="file" class="form-control" id="inputPic" placeholder="Pic" accept="image/png, image/jpeg, image/webp, image/gif">
            </div>
          </div>
          <div class="form-group row">
            <label for="inputName" class="col-sm-2 col-form-label">Username</label>
            <div class="col-sm-10">
              <input type="text" class="form-control" id="inputName" placeholder="Username (must be unique/halitakiwi lifanane na jingine)">
            </div>
          </div>
          <div class="form-group row">
            <label for="firstName" class="col-sm-2 col-form-label">First Name</label>
            <div class="col-sm-10">
              <input type="text" class="form-control" id="firstName" placeholder="First Name">
            </div>
          </div>
          <div class="form-group row">
            <label for="lastName" class="col-sm-2 col-form-label">Last Name</label>
            <div class="col-sm-10">
              <input type="text" class="form-control" id="lastName" placeholder="Last Name">
            </div>
          </div>
          <div class="form-group row">
            <label for="inputEmail" class="col-sm-2 col-form-label">Email</label>
            <div class="col-sm-10">
              <input type="email" class="form-control" id="inputEmail" placeholder="Email">
            </div>
          </div>
          <div class="form-group row">
            <div class="offset-sm-2 col-sm-10">
              <div class="checkbox">
                <label>
                  <input type="checkbox"> I agree to the <a href="#">terms and conditions</a>
                </label>
              </div>
            </div>
          </div>
          <div class="form-group row">
            <div class="offset-sm-2 col-sm-10">
              <button type="submit" class="btn btn-danger" id="profsub">Submit</button>
            </div>
          </div>
        </form>
      </div>
      <!-- /.tab-pane -->
    </div>
    <!-- /.tab-content -->
  </div><!-- /.card-body -->
</div>
<!-- /.card -->
</div>`