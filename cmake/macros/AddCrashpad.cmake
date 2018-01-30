#
#  AddCrashpad.cmake
#  cmake/macros
#
#  Created by Clement Brisset on 01/19/18.
#  Copyright 2018 High Fidelity, Inc.
#
#  Distributed under the Apache License, Version 2.0.
#  See the accompanying file LICENSE or http:#www.apache.org/licenses/LICENSE-2.0.html
#

macro(add_crashpad)
  get_property(CRASHPAD_CHECKED GLOBAL PROPERTY CHECKED_FOR_CRASHPAD_ONCE)

  set (USE_CRASHPAD TRUE)
  if ("$ENV{CMAKE_BACKTRACE_URL}" STREQUAL "")
    set (USE_CRASHPAD FALSE)
  else()
    set (CMAKE_BACKTRACE_URL $ENV{CMAKE_BACKTRACE_URL})
  endif()

  if ("$ENV{CMAKE_BACKTRACE_TOKEN}" STREQUAL "")
    set (USE_CRASHPAD FALSE)
  else()
    set (CMAKE_BACKTRACE_TOKEN $ENV{CMAKE_BACKTRACE_TOKEN})
  endif()

  if (WIN32 AND USE_CRASHPAD AND NOT CRASHPAD_CHECKED)
    add_definitions(-DHAS_CRASHPAD)
    add_definitions(-DCMAKE_BACKTRACE_URL=\"${CMAKE_BACKTRACE_URL}\")
    add_definitions(-DCMAKE_BACKTRACE_TOKEN=\"${CMAKE_BACKTRACE_TOKEN}\")

    add_dependency_external_projects(crashpad)
    find_package(crashpad REQUIRED)
    target_include_directories(${TARGET_NAME} PRIVATE ${CRASHPAD_INCLUDE_DIRS})
    target_link_libraries(${TARGET_NAME} ${CRASHPAD_LIBRARY} ${CRASHPAD_BASE_LIBRARY} ${CRASHPAD_UTIL_LIBRARY})
    
    if (WIN32)
      set_target_properties(${TARGET_NAME} PROPERTIES LINK_FLAGS "/ignore:4099")
    endif()

    add_custom_command(
      TARGET ${TARGET_NAME}
      POST_BUILD
      COMMAND ${CMAKE_COMMAND} -E copy ${CRASHPAD_HANDLER_EXE_PATH} "$<TARGET_FILE_DIR:${TARGET_NAME}>/"
    )
    install(
      PROGRAMS ${CRASHPAD_HANDLER_EXE_PATH}
      DESTINATION ${CLIENT_COMPONENT}
      COMPONENT ${INTERFACE_INSTALL_DIR}
    )

    set_property(GLOBAL PROPERTY CHECKED_FOR_CRASHPAD_ONCE TRUE)
  endif ()
endmacro()
