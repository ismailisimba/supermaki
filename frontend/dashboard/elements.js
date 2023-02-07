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
      <img class="profile-user-img img-fluid" src="../icons/noprofile.png" alt="User profile picture">
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
            <img id="inputhumb" src="./icons/noprofile.png" width="169px">
              <input type="file" class="form-control" id="inputPic" name="inputPic" placeholder="Pic" accept="image/png, image/jpeg, image/webp, image/gif">
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
                  <input type="checkbox" name="cheekyone" id="cheekyone"> I agree to the <a href="#">terms and conditions</a>
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
</div>`;

eleObj.card = (() => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div class="card-body">
    <h5 class="card-title">Card title</h5>

    <p class="card-text">
      Some quick example text to build on the card title and make up the bulk of the card's
      content.
    </p>

    <a href="#" class="card-link">Card link</a>
    <a href="#" class="card-link">Another link</a>
  </div>`;
  return card;
})();

eleObj.files = (()=>{
  const card = document.createElement("div");
  card.className = "card-text";
  card.innerHTML = `<div>
  <div class="btn-group w-100 mb-2">
    <a class="btn btn-info active" href="javascript:void(0)" data-filter="all"> All items </a>
    <a class="btn btn-info" href="javascript:void(0)" data-filter="1"> Category 1 (WHITE) </a>
    <a class="btn btn-info" href="javascript:void(0)" data-filter="2"> Category 2 (BLACK) </a>
    <a class="btn btn-info" href="javascript:void(0)" data-filter="3"> Category 3 (COLORED) </a>
    <a class="btn btn-info" href="javascript:void(0)" data-filter="4"> Category 4 (COLORED, BLACK) </a>
  </div>
  <div class="mb-2">
    <a class="btn btn-secondary" href="javascript:void(0)" data-shuffle=""> Shuffle items </a>
    <div class="float-right">
      <select class="custom-select" style="width: auto;" data-sortorder="">
        <option value="index"> Sort by Position </option>
        <option value="sortData"> Sort by Custom Data </option>
      </select>
      <div class="btn-group">
        <a class="btn btn-default" href="javascript:void(0)" data-sortasc=""> Ascending </a>
        <a class="btn btn-default" href="javascript:void(0)" data-sortdesc=""> Descending </a>
      </div>
    </div>
  </div>
</div>`;
return card;
})()


eleObj.picBox = (()=>{
  const card = document.createElement("div");
  card.innerHTML = `<ul class="mailbox-attachments d-flex align-items-stretch clearfix">
  <li>
    <span class="mailbox-attachment-icon"><i class="far fa-file-pdf"></i></span>

    <div class="mailbox-attachment-info">
      <a href="#" class="mailbox-attachment-name"><i class="fas fa-paperclip"></i> Sep2014-report.pdf</a>
          <span class="mailbox-attachment-size clearfix mt-1">
            <span>1,245 KB</span>
            <a href="#" class="btn btn-default btn-sm float-right"><i class="fas fa-cloud-download-alt"></i></a>
          </span>
    </div>
  </li>
  <li>
    <span class="mailbox-attachment-icon"><i class="far fa-file-word"></i></span>

    <div class="mailbox-attachment-info">
      <a href="#" class="mailbox-attachment-name"><i class="fas fa-paperclip"></i> App Description.docx</a>
          <span class="mailbox-attachment-size clearfix mt-1">
            <span>1,245 KB</span>
            <a href="#" class="btn btn-default btn-sm float-right"><i class="fas fa-cloud-download-alt"></i></a>
          </span>
    </div>
  </li>
  <li>
    <span class="mailbox-attachment-icon has-img"><img src="../icons/dot.webp" alt="Attachment"></span>

    <div class="mailbox-attachment-info">
      <a href="#" class="mailbox-attachment-name"><i class="fas fa-camera"></i> photo1.png</a>
          <span class="mailbox-attachment-size clearfix mt-1">
            <span>2.67 MB</span>
            <a href="#" class="btn btn-default btn-sm float-right"><i class="fas fa-cloud-download-alt"></i></a>
          </span>
    </div>
  </li>
  <li>
    <span class="mailbox-attachment-icon has-img"><img src="../icons/dot.webp" alt="Attachment"></span>

    <div class="mailbox-attachment-info">
      <a href="#" class="mailbox-attachment-name"><i class="fas fa-camera"></i> photo2.png</a>
          <span class="mailbox-attachment-size clearfix mt-1">
            <span>1.9 MB</span>
            <a href="#" class="btn btn-default btn-sm float-right"><i class="fas fa-cloud-download-alt"></i></a>
          </span>
    </div>
  </li>
</ul>`;
return card;
})()

//write code to separate commas in a number